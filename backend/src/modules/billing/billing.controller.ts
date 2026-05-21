import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto, RecordPaymentDto } from './dto/billing.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}
  @Post() @Roles('admin') create(@Body() dto: CreateBillDto) { return this.billingService.create(dto); }
  @Get('my') @Roles('patient') getMy(@CurrentUser() u: any, @Query() q: any) { return this.billingService.getMyBills(u.id, q); }
  @Get('summary') @Roles('admin') getSummary() { return this.billingService.getBillingSummary(); }
  @Get() @Roles('admin') getAll(@Query() q: any) { return this.billingService.getAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.billingService.findOne(id); }
  @Patch(':id/payment') @Roles('admin') recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) { return this.billingService.recordPayment(id, dto); }
}
