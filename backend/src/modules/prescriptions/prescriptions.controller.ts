import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}
  @Post() @Roles('doctor') create(@CurrentUser() u: any, @Body() dto: CreatePrescriptionDto) { return this.prescriptionsService.create(u.id, dto); }
  @Get('my') @Roles('patient') getMy(@CurrentUser() u: any, @Query() q: any) { return this.prescriptionsService.getMyPrescriptions(u.id, q); }
  @Get('doctor') @Roles('doctor') getDoctor(@CurrentUser() u: any, @Query() q: any) { return this.prescriptionsService.getDoctorPrescriptions(u.id, q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.prescriptionsService.findOne(id); }
  @Patch(':id') @Roles('doctor') update(@Param('id') id: string, @CurrentUser() u: any, @Body() dto: UpdatePrescriptionDto) { return this.prescriptionsService.update(id, u.id, dto); }
}
