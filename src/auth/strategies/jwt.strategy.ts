import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { iJwtPayload } from '../interface/iJwtPayload';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //BEARER DEL HEADER QUE VIENE EN LA PETICION DEL LADO DEL FRONT
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET_AUTH'),
      passReqToCallback: true,
    });
  }

  // VALIDAR PAYLOAD CON ESTRATEGIA DE JWT
  async validate(req: Request, payload: iJwtPayload) {
    if (req?.method === 'OPTIONS') return true;
    return payload; //LO ASIGNA  request.user AUTOMATICAMENTE
  }
}
