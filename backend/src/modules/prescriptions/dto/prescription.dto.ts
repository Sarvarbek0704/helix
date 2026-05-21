import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '../../../database/entities/prescription.entity';

export class PrescriptionItemDto {
  @IsString() medicationName: string;
  @IsString() @IsOptional() medicationId?: string;
  @IsString() dosage: string;
  @IsString() frequency: string;
  @IsString() duration: string;
  @IsString() @IsOptional() instructions?: string;
  @IsInt() @IsOptional() quantity?: number;
  @IsInt() @IsOptional() refillsAllowed?: number;
}

export class CreatePrescriptionDto {
  @IsString() patientId: string;
  @IsString() @IsOptional() appointmentId?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PrescriptionItemDto) items: PrescriptionItemDto[];
  @IsString() @IsOptional() diagnosis?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() validUntil?: string;
}

export class UpdatePrescriptionDto {
  @IsEnum(PrescriptionStatus) @IsOptional() status?: PrescriptionStatus;
  @IsString() @IsOptional() notes?: string;
}
