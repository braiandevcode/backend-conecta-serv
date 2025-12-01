import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

//DTO PARA POST DE VERIFICACION
export class VerifyCodeDto {
    @IsNotEmpty({ message: 'El email no puede estar vacio'})
    @IsString({ message:'El email debe ser una cadena de texto'})
    @IsEmail({require_tld:true, allow_display_name:false}, { message:'El correo no es valido'})
    email: string;

    @IsNotEmpty({ message: 'El código no puede estar vacio'})
    @IsString({ message: 'El código debe ser una cadena de texto' })
    @Length(6, 6, { message: 'El código debe tener 6 caracteres/dígitos' })
    code: string; 

    // TOKEN QUE EL FRONTEND DEBERIA TENER GUARDADO
    @IsNotEmpty({ message: 'El token no puede estar vacio'})
    @IsString({ message: 'El token debe ser una cadena de texto'})
    token: string;
}