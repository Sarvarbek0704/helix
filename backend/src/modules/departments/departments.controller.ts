import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Public() @Get() findAll(@Query('includeInactive') inc?: string) { return this.departmentsService.findAll(inc === 'true'); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.departmentsService.findOne(id); }
  @Post() @Roles('admin') create(@Body() dto: CreateDepartmentDto) { return this.departmentsService.create(dto); }
  @Patch(':id') @Roles('admin') update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) { return this.departmentsService.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.departmentsService.remove(id); }
  @Post('seed') @Roles('admin') seed() { return this.departmentsService.seed(); }
}
