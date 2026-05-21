import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { BillItem } from './bill-item.entity';

export enum BillStatus { PENDING = 'pending', PARTIAL = 'partial', PAID = 'paid', OVERDUE = 'overdue', CANCELLED = 'cancelled', INSURANCE_PENDING = 'insurance_pending' }
export enum PaymentMethod { CASH = 'cash', CARD = 'card', INSURANCE = 'insurance', TRANSFER = 'transfer' }

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column({ nullable: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { nullable: true }) @JoinColumn({ name: 'appointmentId' }) appointment: Appointment;
  @OneToMany(() => BillItem, (item) => item.bill, { cascade: true, eager: true }) items: BillItem[];
  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.PENDING }) status: BillStatus;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) subtotal: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPercent: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) discountAmount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) taxAmount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) totalAmount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) paidAmount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) insuranceCoverage: number;
  @Column({ nullable: true, type: 'enum', enum: PaymentMethod }) paymentMethod: PaymentMethod;
  @Column({ nullable: true }) dueDate: Date;
  @Column({ nullable: true }) paidAt: Date;
  @Column({ nullable: true }) billNumber: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
