import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { CreateVitalsDto } from './dto/vitals.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('vitals')
export class VitalsController {
  constructor(private vitalsService: VitalsService) {}
  @Post() @Roles('nurse', 'doctor', 'admin') record(@CurrentUser() u: any, @Body() dto: CreateVitalsDto) { return this.vitalsService.record(u.id, dto); }
  @Get('my') @Roles('patient') getMy(@CurrentUser() u: any, @Query() q: any) { return this.vitalsService.getMyVitals(u.id, q); }
  @Get('my/latest') @Roles('patient') getLatest(@CurrentUser() u: any) { return this.vitalsService.getLatest(u.id); }
  @Get('patient/:id') @Roles('doctor', 'nurse', 'admin') getPatient(@Param('id') id: string, @Query() q: any) { return this.vitalsService.getPatientVitals(id, q); }
  @Get('patient/:id/latest') @Roles('doctor', 'nurse', 'admin') getPatientLatest(@Param('id') id: string) { return this.vitalsService.getLatest(id); }
}
