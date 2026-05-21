import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}
  @Get() getAll(@CurrentUser() u: any, @Query() q: any) { return this.notificationsService.getAll(u.id, q); }
  @Get('unread-count') getUnreadCount(@CurrentUser() u: any) { return this.notificationsService.getUnreadCount(u.id); }
  @Patch(':id/read') markRead(@Param('id') id: string, @CurrentUser() u: any) { return this.notificationsService.markRead(id, u.id); }
  @Patch('mark-all-read') markAllRead(@CurrentUser() u: any) { return this.notificationsService.markAllRead(u.id); }
  @Delete(':id') delete(@Param('id') id: string, @CurrentUser() u: any) { return this.notificationsService.delete(id, u.id); }
}
