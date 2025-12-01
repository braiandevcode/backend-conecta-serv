import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EWorkAreas } from 'src/common/enums/enumWorkAreas';

export class CreateWorkAreaDto {
  @IsOptional()
  @IsArray({ message: 'los datos de context deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'context no puede estar vacío' })
  @IsNotEmpty({ each: true, message: 'cada elemento no puede estar vacío' })
  @IsString({
    each: true,
    message: 'cada elemento de context debe ser una cadena de texto',
  })
  @IsEnum(EWorkAreas, { message: 'Los valores de areas de trabajo no son validos' })
  workArea: string[]; //EN FRONTEND MODIFICAR A ==> workArea
}
