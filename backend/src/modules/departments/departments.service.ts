import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectRepository(Department) private deptRepo: Repository<Department>) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.deptRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Department name already exists');
    return this.deptRepo.save(this.deptRepo.create(dto));
  }

  async findAll(includeInactive = false) {
    const where: any = includeInactive ? {} : { isActive: true };
    return this.deptRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    await this.deptRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.deptRepo.update(id, { isActive: false });
    return { message: 'Department deactivated' };
  }

  async seed() {
    const departments = [
      { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: 'heart', color: '#ef4444' },
      { name: 'Neurology', description: 'Brain and nervous system', icon: 'brain', color: '#8b5cf6' },
      { name: 'Pediatrics', description: 'Children healthcare', icon: 'baby', color: '#f59e0b' },
      { name: 'Orthopedics', description: 'Bones and joints', icon: 'bone', color: '#06b6d4' },
      { name: 'Dermatology', description: 'Skin conditions', icon: 'shield', color: '#10b981' },
      { name: 'Oncology', description: 'Cancer treatment', icon: 'activity', color: '#f97316' },
      { name: 'Gynecology', description: "Women's health", icon: 'user', color: '#ec4899' },
      { name: 'General Medicine', description: 'Primary care', icon: 'stethoscope', color: '#0891b2' },
    ];
    for (const dept of departments) {
      const exists = await this.deptRepo.findOne({ where: { name: dept.name } });
      if (!exists) await this.deptRepo.save(this.deptRepo.create(dept));
    }
    return { message: 'Departments seeded' };
  }
}
