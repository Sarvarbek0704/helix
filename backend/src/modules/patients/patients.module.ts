import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { Bill } from '../../database/entities/bill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile, User, Appointment, MedicalRecord, Prescription, LabOrder, Bill])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
