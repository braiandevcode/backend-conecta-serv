import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";
import { iJwtPayload } from "../interface/iJwtPayload";
import { ErrorManager } from "src/config/ErrorMannager";
import { ESeparatorsMsgErrors } from "src/common/enums/enumSeparatorMsgErrors";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // LE DICE A PASSPORT
    // BUSCA ==> req.body.userName Y BUSCA req.body.password POR ESO NO ESTA EL DECORADOR @Body()
    super({ usernameField: 'userName', passwordField: 'password' });
  }

  async validate(userName: string, password: string): Promise<iJwtPayload> {
    // REUTILIZO FUNCION QUE ESTA EN AuthService
    const user: iJwtPayload | null = await this.authService.validateUser({ userName, password });
    if (!user) throw ErrorManager.createSignatureError(`UNAUTHORIZED${ESeparatorsMsgErrors.SEPARATOR}No autorizado, Usuario o contraseña invalida.`)
    return user; //PASSPORT LO PONE EN request.user
  }
}
