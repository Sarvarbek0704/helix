import { IsString, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsString() @IsOptional() specialization?: string;
  @IsString() @IsOptional() subSpecialization?: string;
  @IsString() @IsOptional() departmentId?: string;
  @IsString() @IsOptional() licenseNumber?: string;
  @IsNumber() @IsOptional() yearsOfExperience?: number;
  @IsString() @IsOptional() education?: string;
  @IsString() @IsOptional() bio?: string;
  @IsNumber() @IsOptional() consultationFee?: number;
  @IsNumber() @IsOptional() followUpFee?: number;
  @IsArray() @IsOptional() languages?: string[];
  @IsBoolean() @IsOptional() isAcceptingPatients?: boolean;
}
