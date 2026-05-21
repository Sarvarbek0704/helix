import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Bill } from '../../database/entities/bill.entity';
import { BillItem } from '../../database/entities/bill-item.entity';
import { Notification } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillItem, Notification])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
