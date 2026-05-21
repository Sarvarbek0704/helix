import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';

export enum DayOfWeek { MON = 'monday', TUE = 'tuesday', WED = 'wednesday', THU = 'thursday', FRI = 'friday', SAT = 'saturday', SUN = 'sunday' }

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() doctorId: string;
  @ManyToOne(() => DoctorProfile) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ type: 'enum', enum: DayOfWeek }) dayOfWeek: DayOfWeek;
  @Column({ type: 'time' }) startTime: string;
  @Column({ type: 'time' }) endTime: string;
  @Column({ default: 30 }) slotDurationMinutes: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
