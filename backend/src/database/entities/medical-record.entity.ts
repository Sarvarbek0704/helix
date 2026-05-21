import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment } from './appointment.entity';

export enum RecordType { VISIT_NOTE = 'visit_note', DIAGNOSIS = 'diagnosis', PROCEDURE = 'procedure', SURGERY = 'surgery', VACCINATION = 'vaccination', ALLERGY = 'allergy', CHRONIC = 'chronic_condition' }

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() patientId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'patientId' }) patient: User;
  @Column({ nullable: true }) doctorId: string;
  @ManyToOne(() => DoctorProfile, { nullable: true }) @JoinColumn({ name: 'doctorId' }) doctor: DoctorProfile;
  @Column({ nullable: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { nullable: true }) @JoinColumn({ name: 'appointmentId' }) appointment: Appointment;
  @Column({ type: 'enum', enum: RecordType }) type: RecordType;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ nullable: true }) icdCode: string;
  @Column({ type: 'simple-array', nullable: true }) attachments: string[];
  @Column({ nullable: true }) recordDate: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
