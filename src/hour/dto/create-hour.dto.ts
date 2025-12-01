import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';import { EHour } from 'src/common/enums/enumHour';
;

export class CreateHourDto {
  @IsArray({ message: 'los datos de hour deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'hour no puede estar vacío' })
  @IsString({
    each: true,
    message: 'cada elemento de hour debe ser una cadena de texto',
  })
   @IsEnum(EHour, { message: 'Los Horarios establecidos no son válidos.' })
  hour: string[];
}
