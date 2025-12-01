import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HourService } from './hour.service';
import { CreateHourDto } from './dto/create-hour.dto';
import { UpdateHourDto } from './dto/update-hour.dto';

@Controller('hour')
export class HourController {
  constructor(private readonly hourService: HourService) {}

  @Post()
  create(@Body() createHourDto: CreateHourDto) {
    return this.hourService.create(createHourDto);
  }

  @Get()
  findAll() {
    return this.hourService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hourService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHourDto: UpdateHourDto) {
    return this.hourService.update(+id, updateHourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hourService.remove(+id);
  }
}
