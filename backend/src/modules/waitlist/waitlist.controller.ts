import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('waitlist')
export class WaitlistController {
  constructor(private svc: WaitlistService) {}
  @Post() @Roles('patient') add(@CurrentUser() u: any, @Body() dto: any) { return this.svc.addToWaitlist(u.id, dto); }
  @Get('my') @Roles('patient') getMy(@CurrentUser() u: any) { return this.svc.getMyWaitlist(u.id); }
  @Get() @Roles('admin', 'doctor', 'nurse') getAll(@Query() q: any) { return this.svc.getAllWaitlist(q); }
  @Patch(':id/status') @Roles('admin', 'doctor') updateStatus(@Param('id') id: string, @Body() dto: { status: any }) { return this.svc.updateStatus(id, dto.status); }
  @Patch(':id/cancel') @Roles('patient') cancel(@Param('id') id: string, @CurrentUser() u: any) { return this.svc.cancel(id, u.id); }
}
