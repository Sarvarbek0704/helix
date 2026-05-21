import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { User } from '../../database/entities/user.entity';
import { UpdateDoctorProfileDto } from './dto/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorProfile) private profileRepo: Repository<DoctorProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getMyProfile(userId: string) {
    let profile = await this.profileRepo.findOne({ where: { userId }, relations: ['user', 'department'] });
    if (!profile) {
      profile = await this.profileRepo.save(this.profileRepo.create({ userId, specialization: 'General Medicine' }));
      profile = await this.profileRepo.findOne({ where: { userId }, relations: ['user', 'department'] });
    }
    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateDoctorProfileDto) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId, specialization: 'General Medicine', ...dto });
    } else {
      Object.assign(profile, dto);
    }
    return this.profileRepo.save(profile);
  }

  async getAll(query: { page?: number; limit?: number; search?: string; departmentId?: string; specialization?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.profileRepo.createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'user')
      .leftJoinAndSelect('d.department', 'department')
      .skip(skip).take(limit)
      .orderBy('d.rating', 'DESC');

    if (query.departmentId) qb.andWhere('d.departmentId = :deptId', { deptId: query.departmentId });
    if (query.specialization) qb.andWhere('d.specialization ILIKE :spec', { spec: `%${query.specialization}%` });
    if (query.search) qb.andWhere('user.firstName ILIKE :s OR user.lastName ILIKE :s', { s: `%${query.search}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id }, relations: ['user', 'department'] });
    if (!profile) throw new NotFoundException('Doctor not found');
    return profile;
  }

  async getByUserId(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId }, relations: ['user', 'department'] });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }
}
