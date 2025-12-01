import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserIdentifyEmailDto {
  @IsNotEmpty({ message: 'El email no puede estar vacio' })
  @IsEmail({ allow_display_name: false, require_tld: true },{ message: 'El correo ingresado no es valido.' })
  @IsString({ message: 'Email debe ser un texto y email valido' })
  emailIdentify: string;
}
