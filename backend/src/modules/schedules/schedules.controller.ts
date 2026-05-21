import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get('my') @Roles('doctor') getMySchedules(@CurrentUser() user: any) { return this.schedulesService.getMySchedules(user.id); }
  @Post('my') @Roles('doctor') createSchedule(@CurrentUser() user: any, @Body() dto: CreateScheduleDto) { return this.schedulesService.createSchedule(user.id, dto); }
  @Patch('my/:id') @Roles('doctor') updateSchedule(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateScheduleDto) { return this.schedulesService.updateSchedule(user.id, id, dto); }
  @Delete('my/:id') @Roles('doctor') deleteSchedule(@CurrentUser() user: any, @Param('id') id: string) { return this.schedulesService.deleteSchedule(user.id, id); }

  @Public() @Get('doctor/:doctorId') getDoctorSchedules(@Param('doctorId') doctorId: string) { return this.schedulesService.getDoctorSchedules(doctorId); }
  @Public() @Get('doctor/:doctorId/slots') getAvailableSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) { return this.schedulesService.getAvailableSlots(doctorId, date); }
}
