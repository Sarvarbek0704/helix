import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waitlist, WaitlistStatus } from '../../database/entities/waitlist.entity';

@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(Waitlist) private repo: Repository<Waitlist>) {}

  async addToWaitlist(patientId: string, dto: { doctorId: string; preferredDate?: string; reason?: string }) {
    return this.repo.save(this.repo.create({ patientId, ...dto }));
  }

  async getMyWaitlist(patientId: string) {
    return this.repo.find({ where: { patientId }, relations: ['doctor', 'doctor.user', 'doctor.department'], order: { createdAt: 'DESC' } });
  }

  async getAllWaitlist(query: any) {
    const where: any = {};
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status;
    return this.repo.find({ where, relations: ['patient', 'doctor', 'doctor.user'], order: { createdAt: 'ASC' } });
  }

  async updateStatus(id: string, status: WaitlistStatus) {
    await this.repo.update(id, { status });
    return this.repo.findOne({ where: { id } });
  }

  async cancel(id: string, patientId: string) {
    await this.repo.update({ id, patientId }, { status: WaitlistStatus.CANCELLED });
    return { message: 'Removed from waitlist' };
  }
}
