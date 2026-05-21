import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { BloodType } from '../../../database/entities/patient-profile.entity';

export class UpdatePatientProfileDto {
  @IsDateString() @IsOptional() dateOfBirth?: string;
  @IsString() @IsOptional() gender?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() country?: string;
  @IsEnum(BloodType) @IsOptional() bloodType?: BloodType;
  @IsNumber() @IsOptional() height?: number;
  @IsNumber() @IsOptional() weight?: number;
  @IsArray() @IsOptional() allergies?: string[];
  @IsArray() @IsOptional() chronicConditions?: string[];
  @IsString() @IsOptional() emergencyContactName?: string;
  @IsString() @IsOptional() emergencyContactPhone?: string;
  @IsString() @IsOptional() emergencyContactRelation?: string;
  @IsString() @IsOptional() insurancePlanId?: string;
  @IsString() @IsOptional() insuranceMemberId?: string;
}
