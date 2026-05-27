import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(data: { userId?: string; action: string; entityType: string; entityId?: string; details?: any; ipAddress?: string }) {
    await this.repo.save(this.repo.create({
      ...data,
      details: data.details ? JSON.stringify(data.details) : undefined,
    }));
  }

  async findAll(query: { page?: number; limit?: number; userId?: string; action?: string; entityType?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.entityType) where.entityType = query.entityType;
    const [data, total] = await this.repo.findAndCount({
      where, skip, take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
