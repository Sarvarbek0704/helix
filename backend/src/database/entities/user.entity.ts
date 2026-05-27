import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';

export enum UserRole { PATIENT = 'patient', DOCTOR = 'doctor', NURSE = 'nurse', LAB_TECH = 'lab_tech', ADMIN = 'admin' }
export enum UserStatus { ACTIVE = 'active', PENDING = 'pending_verification', SUSPENDED = 'suspended' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ select: false }) password: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT }) role: UserRole;
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING }) status: UserStatus;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) avatar: string;
  @Column({ default: false }) isEmailVerified: boolean;
  @Column({ default: false }) isDemo: boolean;
  @Column({ nullable: true, select: false }) otpCode: string;
  @Column({ nullable: true, select: false }) otpExpires: Date;
  @Column({ nullable: true, select: false }) resetToken: string;
  @Column({ nullable: true, select: false }) resetTokenExpires: Date;
  @Column({ nullable: true, select: false }) refreshToken: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
