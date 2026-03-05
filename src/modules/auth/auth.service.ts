import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUser } from './dtos';
import { User, UserDocument, Progress, ProgressDocument } from '../schemas';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/common/logger/logger.service';
import { EmailService } from 'src/common/utils/mailing/email.service';
import { CreateAdmin } from './dtos/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);
  }
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async registerUser(createDto: CreateUser, isOAuth = false) {
    const session: ClientSession = await this.userModel.db.startSession();

    let existing;
    let newUser;

    try {
      existing = await this.userModel.findOne({ email: createDto.email });
      if (existing) {
        if (isOAuth) {
          return existing.toObject();
        }
        throw new ConflictException('Email already in use');
      }

      const isEmailVerified = isOAuth;
      const emailVerificationToken = isOAuth
        ? null
        : this.generateVerificationToken();
      const emailVerificationExpiry = isOAuth
        ? null
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      await session.withTransaction(async () => {
        const hashedPassword = isOAuth
          ? undefined
          : await bcrypt.hash(createDto.password, 10);
        newUser = new this.userModel({
          ...createDto,
          password: hashedPassword,
          isOAuth,
          isEmailVerified,
          emailVerificationToken,
          emailVerificationExpiry,
        });
        await newUser.save({ session });
      });

      try {
        const verificationUrl = emailVerificationToken
          ? `${process.env.APP_URL}/auth/verify-email?token=${emailVerificationToken}`
          : null;

        await this.emailService.sendUserWelcomeEmail(
          createDto.email,
          createDto.firstName,
          verificationUrl,
        );
        this.logger.log(`Welcome email sent to ${createDto.email}`);
      } catch (emailError) {
        // Log error but don't fail registration if email fails
        this.logger.error(
          `Failed to send welcome email to ${createDto.email}`,
          emailError,
        );
      }

      return newUser.toObject();
    } catch (error) {
      this.logger.error('Error registering user', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async registerAdmin(createDto: CreateAdmin) {
    const session: ClientSession = await this.userModel.db.startSession();

    try {
      const existing = await this.userModel.findOne({ email: createDto.email });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      let newAdmin;

      await session.withTransaction(async () => {
        const hashedPassword = await bcrypt.hash(createDto.password, 10);
        newAdmin = new this.userModel({
          ...createDto,
          password: hashedPassword,
          role: 'admin',
          isOAuth: false,
        });
        await newAdmin.save({ session });
      });

      try {
        await this.emailService.sendUserWelcomeEmail(
          createDto.email,
          createDto.firstName,
        );
        this.logger.log(`Welcome email sent to admin ${createDto.email}`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send welcome email to ${createDto.email}`,
          emailError,
        );
      }

      return newAdmin.toObject();
    } catch (error) {
      this.logger.error('Error registering admin', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException(
        `Invalid or expired verification link. Please register again or contact support.`,
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    this.logger.log(`Email verified for user:${user.email}`);
    return { message: 'Email verified successfully. You can now log in' };
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
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdBy: user.createdBy,
        role: user.role,
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

    const progress = await this.progressModel.findOne({ userId }).lean();
    return {
      ...user,
      hasStartedCourse: progress ? !!progress.courseStartedAt : false,
      progressSummary: progress
        ? {
            overallProgress: progress.overallProgress,
            completedModules: progress.completedModules,
            currentModuleId: progress.currentModuleId,
          }
        : null,
    };
  }
}
