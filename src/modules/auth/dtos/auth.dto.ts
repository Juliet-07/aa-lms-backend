import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateUser {
  @ApiProperty({ example: 'Jane', description: 'First name of the learner' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the learner' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+254712345678' })
  @IsOptional()
  @IsNumber()
  phoneNumber: number;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Southern Africa' })
  @IsString()
  region?: string;

  @ApiProperty({ example: 'SA' })
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Johannesburg' })
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Health' })
  @IsString()
  sector?: string;

  @ApiProperty({ example: 'African Alliance' })
  @IsString()
  organisation?: string;

  @ApiPropertyOptional({
    example: 'Female',
    enum: ['Male', 'Female ', 'Other', 'Prefer not to say'],
  })
  @IsString()
  gender?: string;

  @ApiProperty({ example: '25-34' })
  @IsString()
  ageRange?: string;

  @IsBoolean()
  receiveCommunications?: boolean;
}

export class CreateOAuthUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class CreateAdmin {
  @ApiProperty({ example: 'Admin' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'User' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'admin@kujua360.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secureAdminPass!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
