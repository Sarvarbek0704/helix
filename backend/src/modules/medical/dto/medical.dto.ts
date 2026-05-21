import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { RecordType } from '../../../database/entities/medical-record.entity';

export class CreateMedicalRecordDto {
  @IsString() patientId: string;
  @IsEnum(RecordType) type: RecordType;
  @IsString() title: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() icdCode?: string;
  @IsArray() @IsOptional() attachments?: string[];
  @IsString() @IsOptional() appointmentId?: string;
  @IsDateString() @IsOptional() recordDate?: string;
}

export class UpdateMedicalRecordDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() icdCode?: string;
  @IsArray() @IsOptional() attachments?: string[];
}
