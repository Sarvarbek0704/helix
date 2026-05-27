import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(PatientProfile) private patientRepo: Repository<PatientProfile>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
  ) {}

  async search(q: string, role: string, userId: string) {
    const s = `%${q}%`;
    const results: any = { patients: [], doctors: [], appointments: [], records: [] };

    if (['admin', 'doctor', 'nurse'].includes(role)) {
      results.patients = await this.patientRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.user', 'u')
        .where('u.firstName ILIKE :s OR u.lastName ILIKE :s OR u.email ILIKE :s OR p.patientNumber ILIKE :s', { s })
        .take(5).getMany();

      results.doctors = await this.doctorRepo.createQueryBuilder('d')
        .leftJoinAndSelect('d.user', 'u')
        .leftJoinAndSelect('d.department', 'dept')
        .where('u.firstName ILIKE :s OR u.lastName ILIKE :s OR d.specialization ILIKE :s', { s })
        .take(5).getMany();
    }

    if (role === 'patient') {
      results.appointments = await this.apptRepo.createQueryBuilder('a')
        .leftJoinAndSelect('a.doctor', 'd')
        .leftJoinAndSelect('d.user', 'du')
        .where('a.patientId = :uid', { uid: userId })
        .andWhere('a.reason ILIKE :s OR du.firstName ILIKE :s OR du.lastName ILIKE :s', { s })
        .take(5).getMany();
      results.records = await this.recordRepo.createQueryBuilder('r')
        .where('r.patientId = :uid', { uid: userId })
        .andWhere('r.title ILIKE :s OR r.diagnosis ILIKE :s', { s })
        .take(5).getMany();
    } else {
      results.appointments = await this.apptRepo.createQueryBuilder('a')
        .leftJoinAndSelect('a.doctor', 'd')
        .leftJoinAndSelect('d.user', 'du')
        .leftJoinAndSelect('a.patient', 'pu')
        .where('a.reason ILIKE :s OR a.appointmentNumber ILIKE :s OR pu.firstName ILIKE :s OR pu.lastName ILIKE :s OR du.firstName ILIKE :s', { s })
        .take(5).getMany();
      results.records = await this.recordRepo.createQueryBuilder('r')
        .leftJoinAndSelect('r.patient', 'p')
        .where('r.title ILIKE :s OR r.diagnosis ILIKE :s OR r.icdCode ILIKE :s OR p.firstName ILIKE :s OR p.lastName ILIKE :s', { s })
        .take(5).getMany();
    }

    return results;
  }
}
