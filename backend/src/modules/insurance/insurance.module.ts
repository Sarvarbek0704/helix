import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { InsurancePlan } from '../../database/entities/insurance-plan.entity';
import { InsuranceClaim } from '../../database/entities/insurance-claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InsurancePlan, InsuranceClaim])],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
