import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { DayOfWeek } from '../../../database/entities/doctor-schedule.entity';

export class CreateScheduleDto {
  @IsEnum(DayOfWeek) dayOfWeek: DayOfWeek;
  @IsString() startTime: string;
  @IsString() endTime: string;
  @IsNumber() @IsOptional() slotDurationMinutes?: number;
}

export class UpdateScheduleDto {
  @IsString() @IsOptional() startTime?: string;
  @IsString() @IsOptional() endTime?: string;
  @IsNumber() @IsOptional() slotDurationMinutes?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
