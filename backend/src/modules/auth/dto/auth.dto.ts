import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class RegisterDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(UserRole) @IsOptional() role?: UserRole;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}

export class VerifyOtpDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() otp: string;
}

export class ResendOtpDto {
  @IsEmail() email: string;
}

export class ForgotPasswordDto {
  @IsEmail() email: string;
}

export class ResetPasswordDto {
  @IsString() @IsNotEmpty() token: string;
  @IsString() @MinLength(8) password: string;
}

export class ChangePasswordDto {
  @IsString() @IsNotEmpty() currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}

export class RefreshTokenDto {
  @IsString() @IsNotEmpty() refreshToken: string;
}
