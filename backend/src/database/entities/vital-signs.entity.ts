import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('vital_signs')
export class VitalSigns {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column({ nullable: true }) recordedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'recordedById' }) recordedBy: User;
  @Column({ nullable: true }) appointmentId: string;
  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 1 }) temperature: number;
  @Column({ nullable: true }) systolicBP: number;
  @Column({ nullable: true }) diastolicBP: number;
  @Column({ nullable: true }) heartRate: number;
  @Column({ nullable: true }) respiratoryRate: number;
  @Column({ nullable: true, type: 'decimal', precision: 4, scale: 1 }) oxygenSaturation: number;
  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 1 }) weight: number;
  @Column({ nullable: true, type: 'decimal', precision: 4, scale: 1 }) height: number;
  @Column({ nullable: true, type: 'decimal', precision: 4, scale: 1 }) bmi: number;
  @Column({ nullable: true }) glucoseLevel: number;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true }) recordedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
