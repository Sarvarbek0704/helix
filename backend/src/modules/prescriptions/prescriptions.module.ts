import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription } from '../../database/entities/prescription.entity';
import { PrescriptionItem } from '../../database/entities/prescription-item.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Notification } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, PrescriptionItem, DoctorProfile, Notification])],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
