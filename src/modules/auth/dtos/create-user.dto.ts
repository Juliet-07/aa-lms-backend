import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';

export class CreateUser {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  phoneNumber: number;

  @IsString()
  @MinLength(6)
  password: string;
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

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
