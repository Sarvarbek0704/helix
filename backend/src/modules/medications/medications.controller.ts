import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('medications')
export class MedicationsController {
  constructor(private medicationsService: MedicationsService) {}
  @Public() @Get() findAll(@Query() q: any) { return this.medicationsService.findAll(q); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.medicationsService.findOne(id); }
  @Post() @Roles('admin') create(@Body() dto: any) { return this.medicationsService.create(dto); }
  @Patch(':id') @Roles('admin') update(@Param('id') id: string, @Body() dto: any) { return this.medicationsService.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.medicationsService.remove(id); }
  @Post('seed') @Roles('admin') seed() { return this.medicationsService.seed(); }
}
