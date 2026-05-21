import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}
  @Get('admin') @Roles('admin') getAdminDashboard() { return this.analyticsService.getAdminDashboard(); }
  @Get('patient') @Roles('patient') getPatientDashboard(@CurrentUser() u: any) { return this.analyticsService.getPatientDashboard(u.id); }
  @Get('doctor') @Roles('doctor') getDoctorDashboard(@CurrentUser() u: any) { return this.analyticsService.getDoctorDashboard(u.id); }
}
