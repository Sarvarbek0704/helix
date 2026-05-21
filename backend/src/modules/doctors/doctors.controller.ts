import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/doctor.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get('me') @Roles('doctor') getMyProfile(@CurrentUser() user: any) { return this.doctorsService.getMyProfile(user.id); }
  @Patch('me') @Roles('doctor') updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateDoctorProfileDto) { return this.doctorsService.updateMyProfile(user.id, dto); }
  @Get() getAll(@Query() query: any) { return this.doctorsService.getAll(query); }
  @Get(':id') getById(@Param('id') id: string) { return this.doctorsService.getById(id); }
}
