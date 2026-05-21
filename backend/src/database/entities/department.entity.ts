import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) icon: string;
  @Column({ nullable: true }) color: string;
  @Column({ nullable: true }) location: string;
  @Column({ nullable: true }) phone: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
