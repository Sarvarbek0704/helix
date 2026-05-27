import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) userId: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'userId' }) user: User;
  @Column() action: string; // e.g. 'CREATE_APPOINTMENT', 'UPDATE_USER', 'DELETE_BILL'
  @Column() entityType: string; // e.g. 'Appointment', 'User', 'Bill'
  @Column({ nullable: true }) entityId: string;
  @Column({ type: 'text', nullable: true }) details: string; // JSON string
  @Column({ nullable: true }) ipAddress: string;
  @Column({ nullable: true }) userAgent: string;
  @CreateDateColumn() createdAt: Date;
}
