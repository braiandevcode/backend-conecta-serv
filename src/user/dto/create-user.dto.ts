import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateLocationDto } from 'src/location/dto/create-location.dto';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { CreateTaskerDto } from 'src/tasker/dto/create-tasker.dto';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nombre completo no puede estar vacio' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto ' })
  @MinLength(7)
  fullName: string;

  @IsNotEmpty({ message: 'Nombre completo no puede estar vacio' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto ' })
  @MinLength(3, { message: 'Longitud de nombre de usuario invalida'})
  userName: string;

  @IsNotEmpty({ message: 'El email no puede estar vacio' })
  @IsEmail({ allow_display_name:false, require_tld:true }, {message: 'El correo ingresado no es valido.'})
  @IsString({ message: 'Email debe ser un texto y email valido' })
  email: string;

  @IsNotEmpty({ message: 'Password requerido' })
  @IsString({ message: 'password debe ser de tipo string' })
  @MinLength(8)
  password: string;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  locationData: CreateLocationDto;
  
  // PARA VALIDACIONES ANIDADAS
  @ValidateNested() // INDICA AL VALIDADOR QUE REVISE LA CLASE ANIDADA
  @Type(() => CreateRoleDto) // 2. INDICA A class-transformer QUE CLASE DEBE INSTANCIAR.
  roleData: CreateRoleDto;

  @IsNotEmpty({ message: 'Debe tener un valor' })
  @IsBoolean({ message: 'isVerified debe ser un boolean' })
  isVerified: boolean;

  @IsOptional()
  taskerData?:CreateTaskerDto
}
