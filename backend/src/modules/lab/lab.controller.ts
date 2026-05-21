import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabOrderDto, AddLabResultDto, UpdateLabOrderStatusDto } from './dto/lab.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('lab')
export class LabController {
  constructor(private labService: LabService) {}
  @Post('orders') @Roles('doctor') createOrder(@CurrentUser() u: any, @Body() dto: CreateLabOrderDto) { return this.labService.createOrder(u.id, dto); }
  @Get('orders/my') @Roles('patient') getMyOrders(@CurrentUser() u: any, @Query() q: any) { return this.labService.getMyOrders(u.id, q); }
  @Get('orders') @Roles('admin', 'lab_tech', 'doctor') getAllOrders(@Query() q: any) { return this.labService.getAllOrders(q); }
  @Get('orders/:id') findOrder(@Param('id') id: string) { return this.labService.findOrder(id); }
  @Patch('orders/:id/status') @Roles('lab_tech', 'admin') updateStatus(@Param('id') id: string, @Body() dto: UpdateLabOrderStatusDto) { return this.labService.updateOrderStatus(id, dto); }
  @Post('orders/:id/results') @Roles('lab_tech') addResult(@Param('id') id: string, @CurrentUser() u: any, @Body() dto: AddLabResultDto) { return this.labService.addResult(id, u.id, dto); }
}
