import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabOrder, LabOrderStatus } from '../../database/entities/lab-order.entity';
import { LabResult } from '../../database/entities/lab-result.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { CreateLabOrderDto, AddLabResultDto, UpdateLabOrderStatusDto } from './dto/lab.dto';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabOrder) private orderRepo: Repository<LabOrder>,
    @InjectRepository(LabResult) private resultRepo: Repository<LabResult>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async createOrder(doctorUserId: string, dto: CreateLabOrderDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) throw new ForbiddenException();
    const order = this.orderRepo.create({
      patientId: dto.patientId, doctorId: doctor.id,
      appointmentId: dto.appointmentId, tests: dto.tests,
      priority: dto.priority, clinicalNotes: dto.clinicalNotes,
      status: LabOrderStatus.ORDERED,
      orderNumber: `LAB-${Date.now().toString(36).toUpperCase()}`,
    });
    return this.orderRepo.save(order);
  }

  async getMyOrders(patientId: string, query: any) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const [data, total] = await this.orderRepo.findAndCount({
      where: { patientId }, skip, take: limit,
      relations: ['doctor', 'doctor.user', 'results'],
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getAllOrders(query: any) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    const [data, total] = await this.orderRepo.findAndCount({ where, skip, take: limit, relations: ['patient', 'doctor', 'doctor.user', 'results'], order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async findOrder(id: string) {
    const o = await this.orderRepo.findOne({ where: { id }, relations: ['patient', 'doctor', 'doctor.user', 'results'] });
    if (!o) throw new NotFoundException('Lab order not found');
    return o;
  }

  async updateOrderStatus(id: string, dto: UpdateLabOrderStatusDto) {
    await this.findOrder(id);
    const update: any = { status: dto.status };
    if (dto.status === LabOrderStatus.SAMPLE_COLLECTED) update.collectedAt = new Date();
    if (dto.status === LabOrderStatus.COMPLETED) update.completedAt = new Date();
    await this.orderRepo.update(id, update);
    return this.findOrder(id);
  }

  async addResult(orderId: string, techUserId: string, dto: AddLabResultDto) {
    const order = await this.findOrder(orderId);
    const result = this.resultRepo.create({ labOrderId: orderId, verifiedById: techUserId, ...dto });
    const saved = await this.resultRepo.save(result);
    const allResults = await this.resultRepo.count({ where: { labOrderId: orderId } });
    if (allResults >= order.tests.length) {
      await this.orderRepo.update(orderId, { status: LabOrderStatus.COMPLETED, completedAt: new Date() });
      await this.notifRepo.save(this.notifRepo.create({
        userId: order.patientId, type: NotificationType.LAB_RESULT_READY,
        title: 'Lab Results Ready', message: 'Your lab results are ready. Please check your portal.',
      }));
    }
    return saved;
  }
}
