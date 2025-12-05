import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    schoolName?: string;
    studentsLimit?: number;
    phoneNumber?: number;
    createdBy?: User;
  }) {
    if (!payload.sub) {
      console.log('ERROR: Missing sub in payload');
      throw new UnauthorizedException('Missing user ID in token');
    }

    const user = {
      _id: payload.sub,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      age: payload.age,
      email: payload.email,
      createdBy: payload.createdBy,
    };
    console.log(`Returning user object: ${JSON.stringify(user)}`);
    return user;
  }
}
