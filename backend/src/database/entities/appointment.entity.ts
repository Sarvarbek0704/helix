import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';
import { Department } from './department.entity';

export enum AppointmentStatus { PENDING = 'pending', CONFIRMED = 'confirmed', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', CANCELLED = 'cancelled', NO_SHOW = 'no_show' }
export enum AppointmentType { IN_PERSON = 'in_person', TELEMEDICINE = 'telemedicine', FOLLOW_UP = 'follow_up', EMERGENCY = 'emergency' }

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column() doctorId: string;
  @ManyToOne(() => DoctorProfile) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ nullable: true }) departmentId: string;
  @ManyToOne(() => Department, { nullable: true }) @JoinColumn({ name: 'departmentId' }) department: Department;
  @Column({ type: 'date' }) appointmentDate: string;
  @Column({ type: 'time' }) appointmentTime: string;
  @Column({ default: 30 }) durationMinutes: number;
  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING }) status: AppointmentStatus;
  @Column({ type: 'enum', enum: AppointmentType, default: AppointmentType.IN_PERSON }) type: AppointmentType;
  @Column({ nullable: true }) reason: string;
  @Column({ nullable: true }) symptoms: string;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true }) doctorNotes: string;
  @Column({ nullable: true }) diagnosis: string;
  @Column({ nullable: true }) cancelReason: string;
  @Column({ nullable: true }) appointmentNumber: string;
  @Column({ nullable: true }) fee: number;
  @Column({ default: false }) isPaid: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
