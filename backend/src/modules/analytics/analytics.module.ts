import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Bill } from '../../database/entities/bill.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { Department } from '../../database/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Appointment, Bill, LabOrder, Prescription, DoctorProfile, MedicalRecord, Department])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
