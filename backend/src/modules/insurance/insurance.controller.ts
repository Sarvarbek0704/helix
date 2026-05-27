import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('insurance')
export class InsuranceController {
  constructor(private insuranceService: InsuranceService) {}
  @Public() @Get('plans') getPlans() { return this.insuranceService.getPlans(); }
  @Public() @Get('plans/:id') getPlan(@Param('id') id: string) { return this.insuranceService.getPlan(id); }
  @Post('plans') @Roles('admin') createPlan(@Body() dto: any) { return this.insuranceService.createPlan(dto); }
  @Patch('plans/:id') @Roles('admin') updatePlan(@Param('id') id: string, @Body() dto: any) { return this.insuranceService.updatePlan(id, dto); }
  @Post('claims') @Roles('patient', 'admin') submitClaim(@CurrentUser() u: any, @Body() dto: any) { return this.insuranceService.submitClaim(u.id, dto); }
  @Get('claims/my') @Roles('patient', 'doctor', 'nurse', 'lab_tech', 'admin') getMyClaims(@CurrentUser() u: any) { return this.insuranceService.getMyClaims(u.id); }
  @Get('claims') @Roles('admin', 'doctor', 'nurse') getAllClaims(@Query() q: any) { return this.insuranceService.getAllClaims(q); }
  @Patch('claims/:id') @Roles('admin') processClaim(@Param('id') id: string, @Body() dto: any) { return this.insuranceService.processClaim(id, dto); }
}
