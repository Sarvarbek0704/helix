import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { Bill } from '../../database/entities/bill.entity';
import { UpdatePatientProfileDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientProfile) private profileRepo: Repository<PatientProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
    @InjectRepository(LabOrder) private labRepo: Repository<LabOrder>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
  ) {}

  async getMyProfile(userId: string) {
    let profile = await this.profileRepo.findOne({ where: { userId }, relations: ['user'] });
    if (!profile) {
      profile = await this.profileRepo.save(this.profileRepo.create({ userId }));
      profile = await this.profileRepo.findOne({ where: { userId }, relations: ['user'] });
    }
    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdatePatientProfileDto) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId, ...dto });
    } else {
      Object.assign(profile, dto);
    }
    return this.profileRepo.save(profile);
  }

  async getPatientById(patientId: string, requesterId: string, requesterRole: string) {
    // patientId can be either the PatientProfile.id or the User.id
    let profile = await this.profileRepo.findOne({ where: { id: patientId }, relations: ['user'] });
    if (!profile) {
      profile = await this.profileRepo.findOne({ where: { userId: patientId }, relations: ['user'] });
    }
    if (!profile) throw new NotFoundException('Patient not found');
    return profile;
  }

  async getAllPatients(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.profileRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .skip(skip)
      .take(limit)
      .orderBy('p.createdAt', 'DESC');

    if (query.search) {
      qb.where('user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s', { s: `%${query.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTimeline(patientId: string) {
    const [appointments, records, prescriptions, labOrders, bills] = await Promise.all([
      this.apptRepo.find({ where: { patientId }, relations: ['doctor', 'doctor.user', 'department'], order: { appointmentDate: 'DESC' }, take: 20 }).catch(() => []),
      this.recordRepo.find({ where: { patientId }, relations: ['doctor', 'doctor.user'], order: { recordDate: 'DESC' }, take: 20 }).catch(() => []),
      this.prescRepo.find({ where: { patientId }, relations: ['doctor', 'doctor.user'], order: { createdAt: 'DESC' }, take: 20 }).catch(() => []),
      this.labRepo.find({ where: { patientId }, relations: ['doctor', 'doctor.user'], order: { createdAt: 'DESC' }, take: 20 }).catch(() => []),
      this.billRepo.find({ where: { patientId }, order: { createdAt: 'DESC' }, take: 20 }).catch(() => []),
    ]);

    const timeline: any[] = [
      ...appointments.map(a => ({ type: 'appointment', date: a.appointmentDate || a.createdAt, data: a })),
      ...records.map(r => ({ type: 'record', date: r.recordDate || r.createdAt, data: r })),
      ...prescriptions.map(p => ({ type: 'prescription', date: p.createdAt, data: p })),
      ...labOrders.map(l => ({ type: 'lab', date: l.createdAt, data: l })),
      ...bills.map(b => ({ type: 'bill', date: b.createdAt, data: b })),
    ];

    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async toggleFavoriteDoctor(patientUserId: string, doctorId: string) {
    let profile = await this.profileRepo.findOne({ where: { userId: patientUserId } });
    if (!profile) profile = await this.profileRepo.save(this.profileRepo.create({ userId: patientUserId }));
    const favs = profile.favoriteDoctorIds || [];
    const idx = favs.indexOf(doctorId);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(doctorId);
    await this.profileRepo.update(profile.id, { favoriteDoctorIds: favs });
    return { favoriteDoctorIds: favs };
  }

  async getFavoriteDoctors(patientUserId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId: patientUserId } });
    if (!profile?.favoriteDoctorIds?.length) return [];
    return profile.favoriteDoctorIds;
  }
}
