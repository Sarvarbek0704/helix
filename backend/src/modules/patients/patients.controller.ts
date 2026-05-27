import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UpdatePatientProfileDto } from './dto/patient.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('me') getMyProfile(@CurrentUser() user: any) { return this.patientsService.getMyProfile(user.id); }
  @Patch('me') updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdatePatientProfileDto) { return this.patientsService.updateMyProfile(user.id, dto); }
  @Get('my/timeline') @Roles('patient') getMyTimeline(@CurrentUser() u: any) { return this.patientsService.getTimeline(u.id); }
  @Get('favorites') @Roles('patient') getFavs(@CurrentUser() u: any) { return this.patientsService.getFavoriteDoctors(u.id); }
  @Post('favorites/:doctorId') @Roles('patient') toggleFav(@CurrentUser() u: any, @Param('doctorId') doctorId: string) { return this.patientsService.toggleFavoriteDoctor(u.id, doctorId); }
  @Get() @Roles('admin', 'doctor', 'nurse') getAll(@Query() query: any) { return this.patientsService.getAllPatients(query); }
  @Get(':id') @Roles('admin', 'doctor', 'nurse') getById(@Param('id') id: string, @CurrentUser() user: any) { return this.patientsService.getPatientById(id, user.id, user.role); }
  @Get(':id/timeline') @Roles('admin', 'doctor', 'nurse') getTimeline(@Param('id') id: string) { return this.patientsService.getTimeline(id); }
}
