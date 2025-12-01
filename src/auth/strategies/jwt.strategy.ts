import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { iJwtPayload } from "../interface/iJwtPayload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //BEARER DEL HEADER QUE VIENE EN LA PETICION DEL LADO DEL FRONT
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET_AUTH'),
    });
  }
  
  // VALIDAR PAYLOAD CON ESTRATEGIA DE JWT
  async validate(payload: iJwtPayload) {
    return payload; //LO ASIGNA  request.user AUTOMATICAMENTE
  }
}