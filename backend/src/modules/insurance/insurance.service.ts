import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsurancePlan } from '../../database/entities/insurance-plan.entity';
import { InsuranceClaim, ClaimStatus } from '../../database/entities/insurance-claim.entity';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsurancePlan) private planRepo: Repository<InsurancePlan>,
    @InjectRepository(InsuranceClaim) private claimRepo: Repository<InsuranceClaim>,
  ) {}

  async getPlans() { return this.planRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }); }
  async getPlan(id: string) {
    const p = await this.planRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Insurance plan not found');
    return p;
  }
  async createPlan(dto: Partial<InsurancePlan>) { return this.planRepo.save(this.planRepo.create(dto)); }
  async updatePlan(id: string, dto: Partial<InsurancePlan>) { await this.planRepo.update(id, dto); return this.getPlan(id); }

  async submitClaim(patientId: string, dto: { billId: string; insurancePlanId: string; claimedAmount: number }) {
    const claim = this.claimRepo.create({
      patientId, billId: dto.billId, insurancePlanId: dto.insurancePlanId,
      claimedAmount: dto.claimedAmount, status: ClaimStatus.SUBMITTED,
      claimNumber: `CLM-${Date.now().toString(36).toUpperCase()}`, submittedAt: new Date(),
    });
    return this.claimRepo.save(claim);
  }

  async getMyClaims(patientId: string) {
    return this.claimRepo.find({ where: { patientId }, relations: ['bill', 'insurancePlan'], order: { createdAt: 'DESC' } });
  }

  async getAllClaims(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.claimRepo.find({ where, relations: ['patient', 'bill', 'insurancePlan'], order: { createdAt: 'DESC' } });
  }

  async processClaim(id: string, dto: { status: ClaimStatus; approvedAmount?: number; rejectionReason?: string }) {
    await this.claimRepo.update(id, { ...dto, resolvedAt: new Date() });
    const c = await this.claimRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Claim not found');
    return c;
  }
}
