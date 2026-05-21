import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { DoctorSchedule } from '../../database/entities/doctor-schedule.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Appointment } from '../../database/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorSchedule, DoctorProfile, Appointment])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
