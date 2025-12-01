import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}
}
