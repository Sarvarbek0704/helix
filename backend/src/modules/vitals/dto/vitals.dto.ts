import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateVitalsDto {
  @IsString() patientId: string;
  @IsString() @IsOptional() appointmentId?: string;
  @IsNumber() @IsOptional() temperature?: number;
  @IsNumber() @IsOptional() systolicBP?: number;
  @IsNumber() @IsOptional() diastolicBP?: number;
  @IsNumber() @IsOptional() heartRate?: number;
  @IsNumber() @IsOptional() respiratoryRate?: number;
  @IsNumber() @IsOptional() oxygenSaturation?: number;
  @IsNumber() @IsOptional() weight?: number;
  @IsNumber() @IsOptional() height?: number;
  @IsNumber() @IsOptional() glucoseLevel?: number;
  @IsString() @IsOptional() notes?: string;
  @IsDateString() @IsOptional() recordedAt?: string;
}
