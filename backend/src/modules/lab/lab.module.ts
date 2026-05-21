import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabResult } from '../../database/entities/lab-result.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Notification } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabOrder, LabResult, DoctorProfile, Notification])],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
