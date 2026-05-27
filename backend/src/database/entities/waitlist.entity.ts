import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';

export enum WaitlistStatus { WAITING = 'waiting', NOTIFIED = 'notified', BOOKED = 'booked', CANCELLED = 'cancelled' }

@Entity('waitlist')
export class Waitlist {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column() doctorId: string;
  @ManyToOne(() => DoctorProfile) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ nullable: true }) preferredDate: string;
  @Column({ nullable: true }) reason: string;
  @Column({ type: 'enum', enum: WaitlistStatus, default: WaitlistStatus.WAITING }) status: WaitlistStatus;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}
