import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Bill } from './bill.entity';
import { InsurancePlan } from './insurance-plan.entity';

export enum ClaimStatus { SUBMITTED = 'submitted', UNDER_REVIEW = 'under_review', APPROVED = 'approved', PARTIALLY_APPROVED = 'partially_approved', REJECTED = 'rejected', PAID = 'paid' }

@Entity('insurance_claims')
export class InsuranceClaim {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column() billId: string;
  @ManyToOne(() => Bill) @JoinColumn({ name: 'billId' }) bill: Bill;
  @Column({ nullable: true }) insurancePlanId: string;
  @ManyToOne(() => InsurancePlan, { nullable: true }) @JoinColumn({ name: 'insurancePlanId' }) insurancePlan: InsurancePlan;
  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.SUBMITTED }) status: ClaimStatus;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) claimedAmount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) approvedAmount: number;
  @Column({ nullable: true }) claimNumber: string;
  @Column({ nullable: true }) rejectionReason: string;
  @Column({ nullable: true }) submittedAt: Date;
  @Column({ nullable: true }) resolvedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
