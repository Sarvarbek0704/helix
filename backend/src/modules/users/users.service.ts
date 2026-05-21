import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(query: { page?: number; limit?: number; role?: string; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) where.email = Like(`%${query.search}%`);

    const [data, total] = await this.userRepo.findAndCount({ where, skip, take: limit, order: { createdAt: 'DESC' } });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.userRepo.update(userId, dto);
    return this.findById(userId);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    await this.findById(id);
    await this.userRepo.update(id, dto as any);
    return this.findById(id);
  }

  async suspend(id: string) {
    await this.findById(id);
    await this.userRepo.update(id, { status: UserStatus.SUSPENDED });
    return { message: 'User suspended' };
  }

  async activate(id: string) {
    await this.findById(id);
    await this.userRepo.update(id, { status: UserStatus.ACTIVE });
    return { message: 'User activated' };
  }

  async delete(id: string) {
    await this.findById(id);
    await this.userRepo.delete(id);
    return { message: 'User deleted' };
  }

  async getStats() {
    const total = await this.userRepo.count();
    const patients = await this.userRepo.count({ where: { role: UserRole.PATIENT } });
    const doctors = await this.userRepo.count({ where: { role: UserRole.DOCTOR } });
    const nurses = await this.userRepo.count({ where: { role: UserRole.NURSE } });
    const admins = await this.userRepo.count({ where: { role: UserRole.ADMIN } });
    return { total, patients, doctors, nurses, admins };
  }
}
