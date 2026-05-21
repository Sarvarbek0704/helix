import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UpdatePatientProfileDto } from './dto/patient.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('me') getMyProfile(@CurrentUser() user: any) { return this.patientsService.getMyProfile(user.id); }
  @Patch('me') updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdatePatientProfileDto) { return this.patientsService.updateMyProfile(user.id, dto); }
  @Get() @Roles('admin', 'doctor', 'nurse') getAll(@Query() query: any) { return this.patientsService.getAllPatients(query); }
  @Get(':id') @Roles('admin', 'doctor', 'nurse') getById(@Param('id') id: string, @CurrentUser() user: any) { return this.patientsService.getPatientById(id, user.id, user.role); }
}
