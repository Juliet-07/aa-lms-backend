import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUser } from './dtos';
import { User, UserDocument } from '../schemas';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/common/logger/logger.service';
import { EmailService } from 'src/common/utils/mailing/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async registerUser(createDto: CreateUser, isOAuth = false) {
    const session: ClientSession = await this.userModel.db.startSession();

    let existing;
    let newUser;
    let isNewUser = false;

    try {
      existing = await this.userModel.findOne({ email: createDto.email });
      if (existing) {
        if (isOAuth) {
          return existing.toObject();
        }
        throw new ConflictException('Email already in use');
      }

      isNewUser = true;

      await session.withTransaction(async () => {
        const hashedPassword = isOAuth
          ? undefined
          : await bcrypt.hash(createDto.password, 10);
        newUser = new this.userModel({
          ...createDto,
          password: hashedPassword,
          isOAuth,
        });
        await newUser.save({ session });
      });

      // if (!isOAuth) {
      try {
        await this.emailService.sendUserWelcomeEmail(
          createDto.email,
          createDto.firstName,
        );
        this.logger.log(`Welcome email sent to ${createDto.email}`);
      } catch (emailError) {
        // Log error but don't fail registration if email fails
        this.logger.error(
          `Failed to send welcome email to ${createDto.email}`,
          emailError,
        );
      }
      // }

      return newUser.toObject();
    } catch (error) {
      this.logger.error('Error registering user', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.userModel
      .findOne({ email: credentials.email })
      .select('+password')
      .lean();

    if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      createdBy: user.createdBy,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdBy: user.createdBy,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
