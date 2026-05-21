import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from '../../database/entities/prescription.entity';
import { PrescriptionItem } from '../../database/entities/prescription-item.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionItem) private itemRepo: Repository<PrescriptionItem>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  private generateNumber(): string { return `RX-${Date.now().toString(36).toUpperCase()}`; }

  async create(doctorUserId: string, dto: CreatePrescriptionDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) throw new ForbiddenException('Doctor profile required');
    const presc = this.prescRepo.create({
      patientId: dto.patientId, doctorId: doctor.id,
      appointmentId: dto.appointmentId, diagnosis: dto.diagnosis,
      notes: dto.notes, validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      status: PrescriptionStatus.ACTIVE,
      prescriptionNumber: this.generateNumber(),
      items: dto.items.map((i) => this.itemRepo.create(i)),
    });
    const saved = await this.prescRepo.save(presc);
    await this.notifRepo.save(this.notifRepo.create({
      userId: dto.patientId, type: NotificationType.PRESCRIPTION_READY,
      title: 'New Prescription', message: `Dr. has written you a new prescription.`,
    }));
    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const p = await this.prescRepo.findOne({ where: { id }, relations: ['doctor', 'doctor.user', 'patient', 'items'] });
    if (!p) throw new NotFoundException('Prescription not found');
    return p;
  }

  async getMyPrescriptions(patientId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const where: any = { patientId };
    if (query.status) where.status = query.status;
    const [data, total] = await this.prescRepo.findAndCount({ where, skip, take: limit, relations: ['doctor', 'doctor.user', 'items'], order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async getDoctorPrescriptions(doctorUserId: string, query: any) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) return { data: [], total: 0 };
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const [data, total] = await this.prescRepo.findAndCount({ where: { doctorId: doctor.id }, skip, take: limit, relations: ['patient', 'items'], order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async update(id: string, doctorUserId: string, dto: UpdatePrescriptionDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    const p = await this.findOne(id);
    if (doctor && p.doctorId !== doctor.id) throw new ForbiddenException();
    await this.prescRepo.update(id, dto);
    return this.findOne(id);
  }
}
