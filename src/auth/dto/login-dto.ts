import { IsString, IsNotEmpty } from 'class-validator';

// DATA TRASNFER OBJECT DE LOGIN
export class LoginDto {
    // USUARIO => USUARIO O EMAIL
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El campo usuario es obligatorio.' })
    userName: string;

    // CONTRASEÑA
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El campo contraseña es obligatorio.' })
    password: string;
}