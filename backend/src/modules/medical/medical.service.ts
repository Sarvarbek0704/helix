import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord, RecordType } from '../../database/entities/medical-record.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical.dto';

@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
  ) {}

  async create(userId: string, dto: CreateMedicalRecordDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    // Nurses won't have a doctor profile; doctorId stays null in that case
    const record = this.recordRepo.create({
      ...dto,
      doctorId: doctor?.id ?? null,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : new Date(),
    });
    return this.recordRepo.save(record);
  }

  async getPatientRecords(patientId: string, query: { type?: RecordType; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { patientId };
    if (query.type) where.type = query.type;
    const [data, total] = await this.recordRepo.findAndCount({
      where, skip, take: limit,
      relations: ['doctor', 'doctor.user'],
      order: { recordDate: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getMyRecords(patientId: string, query: any) {
    return this.getPatientRecords(patientId, query);
  }

  async findOne(id: string) {
    const record = await this.recordRepo.findOne({ where: { id }, relations: ['doctor', 'doctor.user', 'patient'] });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async update(id: string, doctorUserId: string, dto: UpdateMedicalRecordDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    const record = await this.findOne(id);
    if (doctor && record.doctorId !== doctor.id) throw new ForbiddenException();
    await this.recordRepo.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string, doctorUserId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    const record = await this.findOne(id);
    if (doctor && record.doctorId !== doctor.id) throw new ForbiddenException();
    await this.recordRepo.delete(id);
    return { message: 'Record deleted' };
  }
}
