import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// DTO DEL CUERPO PARA ENVIAR CODIO AL SERVICIO EMAILJS
export class RequestCodeDto {
    @IsNotEmpty({ message: 'El email no puede estar vacio'})
    @IsString({ message:'El email debe ser una cadena de texto'})
    @IsEmail({require_tld:true, allow_display_name:false}, { message:'El correo no es válido'})
    emailCode: string;
}