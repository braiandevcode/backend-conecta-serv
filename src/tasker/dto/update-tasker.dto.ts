import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskerDto } from './create-tasker.dto';

export class UpdateTaskerDto extends PartialType(CreateTaskerDto) {}
