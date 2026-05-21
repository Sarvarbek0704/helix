import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @IsString() name: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() icon?: string;
  @IsString() @IsOptional() color?: string;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() phone?: string;
}

export class UpdateDepartmentDto extends CreateDepartmentDto {
  @IsBoolean() @IsOptional() isActive?: boolean;
}
