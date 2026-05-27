import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from '../../database/entities/bill.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Notification } from '../../database/entities/notification.entity';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Prescription, Appointment, Notification])],
  providers: [CronService],
})
export class CronJobsModule {}
