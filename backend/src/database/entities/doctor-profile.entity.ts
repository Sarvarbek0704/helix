import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @OneToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
  @Column({ nullable: true }) departmentId: string;
  @ManyToOne(() => Department, { nullable: true }) @JoinColumn({ name: 'departmentId' }) department: Department;
  @Column() specialization: string;
  @Column({ nullable: true }) subSpecialization: string;
  @Column({ nullable: true }) licenseNumber: string;
  @Column({ nullable: true }) licenseExpiry: Date;
  @Column({ nullable: true }) yearsOfExperience: number;
  @Column({ nullable: true }) education: string;
  @Column({ nullable: true }) bio: string;
  @Column({ nullable: true }) consultationFee: number;
  @Column({ nullable: true }) followUpFee: number;
  @Column({ type: 'simple-array', nullable: true }) languages: string[];
  @Column({ default: true }) isAcceptingPatients: boolean;
  @Column({ default: 0 }) totalPatients: number;
  @Column({ default: 0 }) totalAppointments: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) rating: number;
  @Column({ default: 0 }) reviewCount: number;
  @Column({ nullable: true }) doctorNumber: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
