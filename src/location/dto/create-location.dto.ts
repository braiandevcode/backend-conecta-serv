import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ELocations } from 'src/common/enums/enumLocations';
import normalizeText from 'src/common/utils/normalizeText';

// DTO LOCATION
// export class CreateLocationDto {
//   @Transform(({ value }) => normalizeText(value))
//   @IsEnum(ELocations,  { message: 'La ciudad no es una ubicación permitida.' })
//   @IsNotEmpty({ message: 'La localidad no puede estar vacia' })
//   @IsString({ message: 'La localidad debe ser una cadena de texto' })
//   cityName: ELocations;
// }


// DTO LOCATION
export class CreateLocationDto {
  @Transform(({ value }) => normalizeText(value))
  @IsEnum(ELocations, {
    message: 'La ciudad no es una ubicación permitida.',
  })
  cityName: ELocations;
}