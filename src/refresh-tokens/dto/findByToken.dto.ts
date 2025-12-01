import { IsNotEmpty, IsString } from "class-validator";

export class FindOneByTokenDto{
    @IsString({ message: 'El token debe ser un string'})
    @IsNotEmpty({ message: 'El token no puede estar vacio'})
    token:string;
}