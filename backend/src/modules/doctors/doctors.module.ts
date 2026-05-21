import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, User])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
