import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSigns } from '../../database/entities/vital-signs.entity';
import { CreateVitalsDto } from './dto/vitals.dto';

@Injectable()
export class VitalsService {
  constructor(@InjectRepository(VitalSigns) private vitalsRepo: Repository<VitalSigns>) {}

  async record(recordedById: string, dto: CreateVitalsDto) {
    const bmi = dto.weight && dto.height ? +(dto.weight / ((dto.height / 100) ** 2)).toFixed(1) : null;
    const vital = this.vitalsRepo.create({ ...dto, recordedById, bmi, recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date() });
    return this.vitalsRepo.save(vital);
  }

  async getMyVitals(patientId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const [data, total] = await this.vitalsRepo.findAndCount({ where: { patientId }, skip, take: limit, order: { recordedAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async getPatientVitals(patientId: string, query: any) {
    return this.getMyVitals(patientId, query);
  }

  async getLatest(patientId: string) {
    return this.vitalsRepo.findOne({ where: { patientId }, order: { recordedAt: 'DESC' } });
  }
}
