import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Appointment, MedicalRecord, PatientProfile, DoctorProfile])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
