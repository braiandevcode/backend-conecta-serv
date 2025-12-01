import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ECategory } from 'src/common/enums/enumCategory';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'La categoria no puede estar vacia' })
  @IsString({ message: 'La categoria debe ser una cadena de texto' })
  @IsEnum(ECategory, { message: 'La categoria establecida no es valida.'})
  category: ECategory;
}
