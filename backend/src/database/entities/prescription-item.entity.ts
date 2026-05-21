import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() prescriptionId: string;
  @ManyToOne(() => Prescription, (p) => p.items) @JoinColumn({ name: 'prescriptionId' }) prescription: Prescription;
  @Column() medicationName: string;
  @Column({ nullable: true }) medicationId: string;
  @Column() dosage: string;
  @Column() frequency: string;
  @Column() duration: string;
  @Column({ nullable: true }) instructions: string;
  @Column({ default: 1 }) quantity: number;
  @Column({ default: 0 }) refillsAllowed: number;
}
