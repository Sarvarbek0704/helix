import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('insurance_plans')
export class InsurancePlan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() provider: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80 }) coveragePercent: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) deductible: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) outOfPocketMax: number;
  @Column({ type: 'simple-array', nullable: true }) coveredServices: string[];
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
