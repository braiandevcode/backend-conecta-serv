import { Controller, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskersService } from './taskers.service';
import { UpdateTaskerDto } from './dto/update-tasker.dto';

@Controller('/api/v1/')
export class TaskersController {
  constructor(
    private readonly taskersService: TaskersService,
  ) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskerDto: UpdateTaskerDto) {
    return this.taskersService.update(+id, updateTaskerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskersService.remove(+id);
  }
}
