import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateBudgetDto } from 'src/budget/dto/create-budget.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { CreateDayDto } from 'src/day/dto/create-day.dto';
import { CreateExperienceDto } from 'src/experiences/dto/create-experience.dto';
import { CreateHourDto } from 'src/hour/dto/create-hour.dto';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { CreateServiceDto } from 'src/service/dto/create-service.dto';
import { CreateWorkAreaDto } from 'src/work-area/dto/create-work-area.dto';

// DATOS SOLO PARA TASKERS
export class CreateTaskerDto {
  @IsOptional()
  @IsString({ message: 'la descripcion debe ser una cadena de texto' })
  @MaxLength(350, { message: 'La longitud excede los 350 caracteres' })
  description: string;

  @ValidateNested()
  @Type(() => CreateCategoryDto)
  categoryData: CreateCategoryDto;

  @ValidateNested()
  @Type(() => CreateServiceDto)
  serviceData: CreateServiceDto;

  // @ValidateNested()
  // @Type(() => CreateProfileDto)
  imageProfileData: CreateProfileDto;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateExperienceDto)
  imageExperienceData: CreateExperienceDto[];

  @ValidateNested()
  @Type(() => CreateWorkAreaDto)
  workAreaData: CreateWorkAreaDto;

  @ValidateNested()
  @Type(() => CreateHourDto)
  hourData: CreateHourDto;

  @ValidateNested()
  @Type(() => CreateDayDto)
  dayData: CreateDayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBudgetDto)
  budgetData?: CreateBudgetDto;
}
