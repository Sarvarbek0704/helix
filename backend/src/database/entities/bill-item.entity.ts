import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Bill } from './bill.entity';

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() billId: string;
  @ManyToOne(() => Bill, (b) => b.items) @JoinColumn({ name: 'billId' }) bill: Bill;
  @Column() description: string;
  @Column({ nullable: true }) category: string;
  @Column({ default: 1 }) quantity: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) unitPrice: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) total: number;
}
