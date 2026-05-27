import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}
  @Get() search(@Query('q') q: string, @CurrentUser() user: any) {
    if (!q || q.length < 2) return { patients: [], doctors: [], appointments: [], records: [] };
    return this.searchService.search(q, user.role, user.id);
  }
}
