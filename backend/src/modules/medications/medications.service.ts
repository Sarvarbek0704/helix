import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Medication, MedicationCategory } from '../../database/entities/medication.entity';

@Injectable()
export class MedicationsService {
  constructor(@InjectRepository(Medication) private medRepo: Repository<Medication>) {}

  async findAll(query: { page?: number; limit?: number; search?: string; category?: string }) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;
    if (query.search) where.name = Like(`%${query.search}%`);
    const [data, total] = await this.medRepo.findAndCount({ where, skip, take: limit, order: { name: 'ASC' } });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const med = await this.medRepo.findOne({ where: { id } });
    if (!med) throw new NotFoundException('Medication not found');
    return med;
  }

  async create(dto: Partial<Medication>) { return this.medRepo.save(this.medRepo.create(dto)); }
  async update(id: string, dto: Partial<Medication>) { await this.findOne(id); await this.medRepo.update(id, dto); return this.findOne(id); }
  async remove(id: string) { await this.findOne(id); await this.medRepo.update(id, { isActive: false }); return { message: 'Medication removed' }; }

  async seed() {
    const meds = [
      { name: 'Amoxicillin', genericName: 'Amoxicillin', category: MedicationCategory.ANTIBIOTIC, form: 'Capsule', strength: '500mg', requiresPrescription: true },
      { name: 'Ibuprofen', genericName: 'Ibuprofen', category: MedicationCategory.ANALGESIC, form: 'Tablet', strength: '400mg', requiresPrescription: false },
      { name: 'Lisinopril', genericName: 'Lisinopril', category: MedicationCategory.ANTIHYPERTENSIVE, form: 'Tablet', strength: '10mg', requiresPrescription: true },
      { name: 'Metformin', genericName: 'Metformin HCl', category: MedicationCategory.ANTIDIABETIC, form: 'Tablet', strength: '500mg', requiresPrescription: true },
      { name: 'Cetirizine', genericName: 'Cetirizine HCl', category: MedicationCategory.ANTIHISTAMINE, form: 'Tablet', strength: '10mg', requiresPrescription: false },
      { name: 'Vitamin D3', genericName: 'Cholecalciferol', category: MedicationCategory.VITAMIN, form: 'Capsule', strength: '1000IU', requiresPrescription: false },
      { name: 'Paracetamol', genericName: 'Acetaminophen', category: MedicationCategory.ANALGESIC, form: 'Tablet', strength: '500mg', requiresPrescription: false },
      { name: 'Atorvastatin', genericName: 'Atorvastatin', category: MedicationCategory.OTHER, form: 'Tablet', strength: '20mg', requiresPrescription: true },
    ];
    for (const med of meds) {
      const exists = await this.medRepo.findOne({ where: { name: med.name } });
      if (!exists) await this.medRepo.save(this.medRepo.create(med));
    }
    return { message: 'Medications seeded' };
  }
}
