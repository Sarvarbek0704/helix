import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../../database/entities/appointment.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { User } from '../../database/entities/user.entity';
import { Notification } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, DoctorProfile, User, Notification])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
