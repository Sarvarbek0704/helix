import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment } from './appointment.entity';
import { PrescriptionItem } from './prescription-item.entity';

export enum PrescriptionStatus { ACTIVE = 'active', COMPLETED = 'completed', CANCELLED = 'cancelled', EXPIRED = 'expired' }

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column() doctorId: string;
  @ManyToOne(() => DoctorProfile) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ nullable: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { nullable: true }) @JoinColumn({ name: 'appointmentId' }) appointment: Appointment;
  @OneToMany(() => PrescriptionItem, (item) => item.prescription, { cascade: true, eager: true }) items: PrescriptionItem[];
  @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.ACTIVE }) status: PrescriptionStatus;
  @Column({ nullable: true }) diagnosis: string;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true }) validUntil: Date;
  @Column({ nullable: true }) prescriptionNumber: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
