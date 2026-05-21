import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('medical-records')
export class MedicalController {
  constructor(private medicalService: MedicalService) {}

  @Post() @Roles('doctor', 'nurse') create(@CurrentUser() user: any, @Body() dto: CreateMedicalRecordDto) { return this.medicalService.create(user.id, dto); }
  @Get('my') @Roles('patient') getMyRecords(@CurrentUser() user: any, @Query() query: any) { return this.medicalService.getMyRecords(user.id, query); }
  @Get('patient/:id') @Roles('doctor', 'nurse', 'admin') getPatientRecords(@Param('id') id: string, @Query() query: any) { return this.medicalService.getPatientRecords(id, query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.medicalService.findOne(id); }
  @Patch(':id') @Roles('doctor') update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateMedicalRecordDto) { return this.medicalService.update(id, user.id, dto); }
  @Delete(':id') @Roles('doctor', 'admin') delete(@Param('id') id: string, @CurrentUser() user: any) { return this.medicalService.delete(id, user.id); }
}
