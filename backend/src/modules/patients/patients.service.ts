import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { User } from '../../database/entities/user.entity';
import { UpdatePatientProfileDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientProfile) private profileRepo: Repository<PatientProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
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
    const profile = await this.profileRepo.findOne({ where: { userId: patientId }, relations: ['user'] });
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
}
