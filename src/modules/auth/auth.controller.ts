import {
  UseGuards,
  Get,
  Req,
  Res,
  Controller,
  Body,
  Post,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import { CreateUser, LoginDto } from './dtos';
import { AuthService } from './auth.service';
import { User } from '../schemas';
import { CurrentUser } from '../../common/decorators';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/common/logger/logger.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAdmin } from './dtos/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request) {
    return { message: 'Redirecting to Google login......' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    try {
      const payload = {
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
      };

      const token = await this.jwtService.sign(payload, { expiresIn: '1d' });

      // Redirect to frontend with token in query params
      const frontendUrl =
        process.env.GOOGLE_FRONTEND_URL || 'https://example.com';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      this.logger.error('Error in Google OAuth callback: ', error);
      res.redirect(
        `${process.env.GOOGLE_FRONTEND_URL || 'https://example.com/'}/login?error=OAuthFailed`,
      );
    }
  }

  @Post('register')
  async registerUser(@Body() userDto: CreateUser) {
    return this.authService.registerUser(userDto);
  }

  @Post('register/admin')
  async registerAdmin(@Body() adminDto: CreateAdmin) {
    return this.authService.registerAdmin(adminDto);
  }

  @Post('signin')
  signin(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user._id.toString());
  }
}
