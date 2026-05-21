import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalsController } from './vitals.controller';
import { VitalsService } from './vitals.service';
import { VitalSigns } from '../../database/entities/vital-signs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSigns])],
  controllers: [VitalsController],
  providers: [VitalsService],
  exports: [VitalsService],
})
export class VitalsModule {}
