import {
  UseGuards,
  Get,
  Req,
  Res,
  Controller,
  Body,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUser, LoginDto, CreateAdmin } from './dtos';
import { AuthService } from './auth.service';
import { User } from '../schemas';
import { CurrentUser } from '../../common/decorators';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/common/logger/logger.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  @Get('google')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request) {
    return { message: 'Redirecting to Google login......' };
  }

  @Get('google/callback')
  @ApiExcludeEndpoint()
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
  @ApiOperation({
    summary: 'Register a new learner',
    description:
      'Creates a new user account and sends a welcome email containing an email-verification link. ' +
      'The user cannot log in until they click that link.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created. Verification email sent.',
  })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  async registerUser(@Body() userDto: CreateUser) {
    return this.authService.registerUser(userDto);
  }

  @Get('verify-email')
  @ApiExcludeEndpoint()
  // @ApiOperation({
  //   summary: "Verify a user's email address",
  //   description:
  //     'Called by the link inside the welcome email. ' +
  //     'On success, redirects the browser to `/login?verified=true`. ' +
  //     'On failure (token expired or invalid), redirects to `/login?verified=false`.\n\n' +
  //     "> **Note:** This endpoint is visited directly by the user's browser — it is not a JSON API.",
  // })
  // @ApiQuery({
  //   name: 'token',
  //   required: true,
  //   description:
  //     'The 64-character hex token embedded in the verification email link.',
  //   example: 'a3f9e2d1c4b5...',
  // })
  // @ApiResponse({
  //   status: 302,
  //   description:
  //     'Redirects to frontend with ?verified=true or ?verified=false.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Invalid or expired token (only when called as JSON, not via browser).',
  // })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(token);

      // Redirect to frontend login page with a success flag
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error) {
      // Redirect to frontend with an error flag so the UI can show a message
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);
    }
  }

  @Post('register/admin')
  @ApiOperation({
    summary: 'Register a new admin account',
    description: 'Creates an admin user and sends a welcome email. ',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully.',
  })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  async registerAdmin(@Body() adminDto: CreateAdmin) {
    return this.authService.registerAdmin(adminDto);
  }

  @Post('signin')
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates a user with email + password and returns a JWT access token. ' +
      'Returns **401** if the email has not been verified (for learners).',
  })
  @ApiResponse({ status: 200, type: LoginDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified.',
  })
  signin(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Returns the authenticated user's profile including their course progress summary.",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile with progress summary.',
    schema: {
      example: {
        _id: '64e1234abc',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        role: 'user',
        isEmailVerified: true,
        hasStartedCourse: true,
        progressSummary: {
          overallProgress: 45,
          completedModules: [1],
          currentModuleId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid JWT.',
  })
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user._id.toString());
  }
}
