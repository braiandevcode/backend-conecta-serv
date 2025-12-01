import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkAreaService } from './workArea.service';
import { CreateWorkAreaDto } from './dto/create-work-area.dto';
import { UpdateContextDto } from './dto/update-work-area.dto';

@Controller('work-area')
export class WorkAreaController {
  constructor(private readonly workAreasService: WorkAreaService) {}

  @Post()
  create(@Body() createWorkAreaDto: CreateWorkAreaDto) {
    return this.workAreasService.create(createWorkAreaDto);
  }

  @Get()
  findAll() {
    return this.workAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workAreasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContextDto: UpdateContextDto) {
    return this.workAreasService.update(+id, updateContextDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workAreasService.remove(+id);
  }
}
