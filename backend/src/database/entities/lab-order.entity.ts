import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment } from './appointment.entity';
import { LabResult } from './lab-result.entity';

export enum LabOrderStatus { ORDERED = 'ordered', SAMPLE_COLLECTED = 'sample_collected', PROCESSING = 'processing', COMPLETED = 'completed', CANCELLED = 'cancelled' }
export enum LabOrderPriority { ROUTINE = 'routine', URGENT = 'urgent', STAT = 'stat' }

@Entity('lab_orders')
export class LabOrder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column() doctorId: string;
  @ManyToOne(() => DoctorProfile) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ nullable: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { nullable: true }) @JoinColumn({ name: 'appointmentId' }) appointment: Appointment;
  @OneToMany(() => LabResult, (r) => r.labOrder, { cascade: true }) results: LabResult[];
  @Column({ type: 'enum', enum: LabOrderStatus, default: LabOrderStatus.ORDERED }) status: LabOrderStatus;
  @Column({ type: 'enum', enum: LabOrderPriority, default: LabOrderPriority.ROUTINE }) priority: LabOrderPriority;
  @Column({ type: 'simple-array' }) tests: string[];
  @Column({ nullable: true }) clinicalNotes: string;
  @Column({ nullable: true }) orderNumber: string;
  @Column({ nullable: true }) collectedAt: Date;
  @Column({ nullable: true }) completedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
