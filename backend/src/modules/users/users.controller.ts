import { Controller, Get, Patch, Delete, Param, Body, Query, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me') getMe(@CurrentUser() user: any) { return user; }
  @Patch('me') updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) { return this.usersService.updateMe(user.id, dto); }

  @Get('stats') @Roles('admin') getStats() { return this.usersService.getStats(); }
  @Get() @Roles('admin') findAll(@Query() query: any) { return this.usersService.findAll(query); }
  @Get(':id') @Roles('admin') findById(@Param('id') id: string) { return this.usersService.findById(id); }
  @Patch(':id') @Roles('admin') adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) { return this.usersService.adminUpdate(id, dto); }
  @Post(':id/suspend') @Roles('admin') suspend(@Param('id') id: string) { return this.usersService.suspend(id); }
  @Post(':id/activate') @Roles('admin') activate(@Param('id') id: string) { return this.usersService.activate(id); }
  @Delete(':id') @Roles('admin') delete(@Param('id') id: string) { return this.usersService.delete(id); }
}
