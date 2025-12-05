import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/common/logger/logger.module';
import { User, UserSchema } from '../schemas';
import { GoogleStrategy } from './strategies/googleOauth.strategy';
import googleOauthConfig from '../../config/google-oauth.config';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService): Promise<JwtModuleOptions> => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') as any },
      }),

      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
