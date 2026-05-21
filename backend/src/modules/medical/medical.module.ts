import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalController } from './medical.controller';
import { MedicalService } from './medical.service';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, DoctorProfile])],
  controllers: [MedicalController],
  providers: [MedicalService],
  exports: [MedicalService],
})
export class MedicalModule {}
