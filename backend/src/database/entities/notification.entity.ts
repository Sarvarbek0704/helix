import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType { APPOINTMENT_CONFIRMED = 'appointment_confirmed', APPOINTMENT_REMINDER = 'appointment_reminder', APPOINTMENT_CANCELLED = 'appointment_cancelled', LAB_RESULT_READY = 'lab_result_ready', PRESCRIPTION_READY = 'prescription_ready', BILL_GENERATED = 'bill_generated', CLAIM_UPDATE = 'claim_update', SYSTEM = 'system' }

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
  @Column({ type: 'enum', enum: NotificationType }) type: NotificationType;
  @Column() title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ nullable: true }) link: string;
  @Column({ nullable: true }) metadata: string;
  @Column({ default: false }) isRead: boolean;
  @CreateDateColumn() createdAt: Date;
}
