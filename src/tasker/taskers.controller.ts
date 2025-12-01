import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskersService } from './taskers.service';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { AuthGuard } from '@nestjs/passport';
import { Tasker } from './entities/tasker.entity';
import { Request } from 'express';
import { iJwtPayload } from 'src/auth/interface/iJwtPayload';
import { UserService } from 'src/user/user.service';
import { TDataPayloadUser } from 'src/types/typeDataPayloadProfile';

@Controller('/api/v1/')
export class TaskersController {
  constructor(
    private readonly taskersService: TaskersService,
  ) {}

  // @Get('taskers')
  // @UseGuards(AuthGuard('jwt'))
  // async getTaskers(@Req() req: Request & { user: iJwtPayload }): Promise<TDataPayloadUser[]> {
  //   const userId: string = req.user.sub;
  //   return await this.userService.getActiveTaskers(userId);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskerDto: UpdateTaskerDto) {
    return this.taskersService.update(+id, updateTaskerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskersService.remove(+id);
  }
}
