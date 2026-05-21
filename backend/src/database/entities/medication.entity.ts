import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MedicationCategory { ANTIBIOTIC = 'antibiotic', ANALGESIC = 'analgesic', ANTIHYPERTENSIVE = 'antihypertensive', ANTIDIABETIC = 'antidiabetic', ANTIHISTAMINE = 'antihistamine', ANTIDEPRESSANT = 'antidepressant', VITAMIN = 'vitamin', OTHER = 'other' }

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) genericName: string;
  @Column({ nullable: true }) brand: string;
  @Column({ type: 'enum', enum: MedicationCategory, default: MedicationCategory.OTHER }) category: MedicationCategory;
  @Column({ nullable: true }) form: string;
  @Column({ nullable: true }) strength: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'simple-array', nullable: true }) sideEffects: string[];
  @Column({ type: 'simple-array', nullable: true }) contraindications: string[];
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) requiresPrescription: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
