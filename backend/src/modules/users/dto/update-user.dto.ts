import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class UpdateUserDto {
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() avatar?: string;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @IsString() @IsOptional() status?: string;
}
