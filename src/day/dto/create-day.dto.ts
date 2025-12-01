import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';
import { EDay } from 'src/common/enums/enumDay';

export class CreateDayDto {
  @IsArray({ message: 'los datos de day deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'Arreglo de day no puede estar vacío' })
  @IsString({
    each: true,
    message: 'cada elemento de day debe ser una cadena de texto',
  })
  @IsEnum(EDay, { message: 'Los valores establecidos no son validos como días' })
  day: string[];
}
