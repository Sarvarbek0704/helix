import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}
  @Get() @Roles('admin') findAll(@Query() query: any) { return this.auditService.findAll(query); }
}
