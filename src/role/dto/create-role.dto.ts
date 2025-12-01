import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ERoles } from 'src/common/enums/enumRoles';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'El role es requerido' })
  @IsString({ message: 'El role debe ser una cadena de texto' })
  @IsEnum(ERoles, { message: 'El role estblecido no es válido.' })
  role: ERoles;
}
