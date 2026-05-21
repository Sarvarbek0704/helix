import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { AppointmentType } from '../../../database/entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString() doctorId: string;
  @IsString() appointmentDate: string;
  @IsString() appointmentTime: string;
  @IsEnum(AppointmentType) @IsOptional() type?: AppointmentType;
  @IsString() @IsOptional() reason?: string;
  @IsString() @IsOptional() symptoms?: string;
  @IsNumber() @IsOptional() durationMinutes?: number;
}

export class UpdateAppointmentDto {
  @IsString() @IsOptional() appointmentDate?: string;
  @IsString() @IsOptional() appointmentTime?: string;
  @IsString() @IsOptional() reason?: string;
  @IsString() @IsOptional() symptoms?: string;
}

export class DoctorUpdateDto {
  @IsString() @IsOptional() doctorNotes?: string;
  @IsString() @IsOptional() diagnosis?: string;
}

export class CancelDto {
  @IsString() @IsOptional() reason?: string;
}
