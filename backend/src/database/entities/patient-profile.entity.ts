import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum BloodType { A_POS = 'A+', A_NEG = 'A-', B_POS = 'B+', B_NEG = 'B-', AB_POS = 'AB+', AB_NEG = 'AB-', O_POS = 'O+', O_NEG = 'O-', UNKNOWN = 'unknown' }

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @OneToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
  @Column({ nullable: true }) dateOfBirth: Date;
  @Column({ nullable: true }) gender: string;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) country: string;
  @Column({ type: 'enum', enum: BloodType, default: BloodType.UNKNOWN }) bloodType: BloodType;
  @Column({ nullable: true }) height: number;
  @Column({ nullable: true }) weight: number;
  @Column({ type: 'simple-array', nullable: true }) allergies: string[];
  @Column({ type: 'simple-array', nullable: true }) chronicConditions: string[];
  @Column({ nullable: true }) emergencyContactName: string;
  @Column({ nullable: true }) emergencyContactPhone: string;
  @Column({ nullable: true }) emergencyContactRelation: string;
  @Column({ nullable: true }) insurancePlanId: string;
  @Column({ nullable: true }) insuranceMemberId: string;
  @Column({ nullable: true }) patientNumber: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
