import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, BillStatus, PaymentMethod } from '../../database/entities/bill.entity';
import { BillItem } from '../../database/entities/bill-item.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { CreateBillDto, RecordPaymentDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(BillItem) private itemRepo: Repository<BillItem>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateBillDto) {
    const items = dto.items.map((i) => {
      const qty = i.quantity || 1;
      return this.itemRepo.create({ description: i.description, category: i.category, quantity: qty, unitPrice: i.unitPrice, total: qty * i.unitPrice });
    });
    const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
    const discountAmount = subtotal * ((dto.discountPercent || 0) / 100);
    const taxAmount = (subtotal - discountAmount) * 0.1;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const bill = this.billRepo.create({
      patientId: dto.patientId, appointmentId: dto.appointmentId,
      items, subtotal, discountPercent: dto.discountPercent || 0,
      discountAmount, taxAmount, totalAmount,
      status: BillStatus.PENDING,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: dto.notes,
      billNumber: `BILL-${Date.now().toString(36).toUpperCase()}`,
    });
    const saved = await this.billRepo.save(bill);
    await this.notifRepo.save(this.notifRepo.create({
      userId: dto.patientId, type: NotificationType.BILL_GENERATED,
      title: 'New Bill Generated', message: `A bill of $${totalAmount.toFixed(2)} has been generated for you.`,
    }));
    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const b = await this.billRepo.findOne({ where: { id }, relations: ['patient', 'appointment', 'items'] });
    if (!b) throw new NotFoundException('Bill not found');
    return b;
  }

  async getMyBills(patientId: string, query: any) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const [data, total] = await this.billRepo.findAndCount({ where: { patientId }, skip, take: limit, relations: ['items', 'appointment'], order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async getAll(query: any) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    const [data, total] = await this.billRepo.findAndCount({ where, skip, take: limit, relations: ['patient', 'items'], order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async recordPayment(id: string, dto: RecordPaymentDto) {
    const bill = await this.findOne(id);
    const newPaid = Number(bill.paidAmount) + dto.amount;
    const status = newPaid >= Number(bill.totalAmount) ? BillStatus.PAID : BillStatus.PARTIAL;
    await this.billRepo.update(id, { paidAmount: newPaid, status, paymentMethod: dto.paymentMethod, paidAt: status === BillStatus.PAID ? new Date() : null });
    return this.findOne(id);
  }

  async getBillingSummary() {
    const [total, paid, pending, overdue] = await Promise.all([
      this.billRepo.count(),
      this.billRepo.count({ where: { status: BillStatus.PAID } }),
      this.billRepo.count({ where: { status: BillStatus.PENDING } }),
      this.billRepo.count({ where: { status: BillStatus.OVERDUE } }),
    ]);
    return { total, paid, pending, overdue };
  }
}
