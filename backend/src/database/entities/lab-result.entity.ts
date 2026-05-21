import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LabOrder } from './lab-order.entity';
import { User } from './user.entity';

export enum ResultStatus { NORMAL = 'normal', ABNORMAL = 'abnormal', CRITICAL = 'critical', PENDING = 'pending' }

@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() labOrderId: string;
  @ManyToOne(() => LabOrder, (o) => o.results) @JoinColumn({ name: 'labOrderId' }) labOrder: LabOrder;
  @Column({ nullable: true }) verifiedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'verifiedById' }) verifiedBy: User;
  @Column() testName: string;
  @Column({ nullable: true }) value: string;
  @Column({ nullable: true }) unit: string;
  @Column({ nullable: true }) referenceRange: string;
  @Column({ type: 'enum', enum: ResultStatus, default: ResultStatus.PENDING }) status: ResultStatus;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true }) fileUrl: string;
  @CreateDateColumn() createdAt: Date;
}
