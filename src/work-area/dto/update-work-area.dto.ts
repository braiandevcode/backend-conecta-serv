import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkAreaDto } from './create-work-area.dto';

export class UpdateContextDto extends PartialType(CreateWorkAreaDto) {}
