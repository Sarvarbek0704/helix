import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, DoctorUpdateDto, CancelDto } from './dto/appointment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post() @Roles('patient') create(@CurrentUser() user: any, @Body() dto: CreateAppointmentDto) { return this.appointmentsService.create(user.id, dto); }
  @Get() @Roles('admin') findAll(@Query() query: any) { return this.appointmentsService.findAll(query); }
  @Get('my') @Roles('patient') getMyAppointments(@CurrentUser() user: any, @Query() query: any) { return this.appointmentsService.getMyAppointments(user.id, query); }
  @Get('doctor') @Roles('doctor') getDoctorAppointments(@CurrentUser() user: any, @Query() query: any) { return this.appointmentsService.getDoctorAppointments(user.id, query); }
  @Get('doctor/today-stats') @Roles('doctor') getTodayStats(@CurrentUser() user: any) { return this.appointmentsService.getTodayStats(user.id); }
  @Get(':id') findOne(@Param('id') id: string) { return this.appointmentsService.findOne(id); }
  @Patch(':id/confirm') @Roles('doctor', 'admin', 'nurse') confirm(@Param('id') id: string, @CurrentUser() user: any) { return this.appointmentsService.confirm(id, user.id, user.role); }
  @Patch(':id/start') @Roles('doctor', 'admin', 'nurse') start(@Param('id') id: string, @CurrentUser() user: any) { return this.appointmentsService.start(id, user.id, user.role); }
  @Patch(':id/complete') @Roles('doctor', 'admin') complete(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: DoctorUpdateDto) { return this.appointmentsService.complete(id, user.id, user.role, dto); }
  @Patch(':id/cancel') cancel(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CancelDto) { return this.appointmentsService.cancel(id, user.id, user.role, dto); }
}
