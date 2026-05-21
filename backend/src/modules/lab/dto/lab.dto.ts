import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { LabOrderPriority } from '../../../database/entities/lab-order.entity';
import { ResultStatus } from '../../../database/entities/lab-result.entity';

export class CreateLabOrderDto {
  @IsString() patientId: string;
  @IsArray() tests: string[];
  @IsString() @IsOptional() appointmentId?: string;
  @IsEnum(LabOrderPriority) @IsOptional() priority?: LabOrderPriority;
  @IsString() @IsOptional() clinicalNotes?: string;
}

export class AddLabResultDto {
  @IsString() testName: string;
  @IsString() @IsOptional() value?: string;
  @IsString() @IsOptional() unit?: string;
  @IsString() @IsOptional() referenceRange?: string;
  @IsEnum(ResultStatus) @IsOptional() status?: ResultStatus;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() fileUrl?: string;
}

export class UpdateLabOrderStatusDto {
  @IsString() status: string;
}
