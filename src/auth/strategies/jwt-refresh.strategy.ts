import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { RefreshTokenService } from 'src/refresh-tokens/refresh-tokens.service';
import { ErrorManager } from 'src/config/ErrorMannager';
import { RefreshToken } from 'src/refresh-tokens/entities/refresh-token.entity';
import { iJwtPayload } from '../interface/iJwtPayload';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';

// FUNCION EXTRACTORA PERSONALIZADA
const extractJwtFromCookie = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['refresh_token']; 
  }
  return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService, private readonly refreshTokenService: RefreshTokenService) {
    super({
      jwtFromRequest: extractJwtFromCookie, 
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET_REFRESH'), // USAR LLAVE DE REFRESH
      passReqToCallback:true,
    });
  }

  // VALIDACION
  async validate(req:Request, payload:iJwtPayload) {
    const refreshToken = req.cookies['refresh_token'];
    // SI NO HAY TOKEN
    if(!refreshToken){
      throw ErrorManager.createSignatureError(`UNAUTHORIZED${ESeparatorsMsgErrors.SEPARATOR}No autorizado`)
    }

    // BUSCAR SI EL TOKEN EXISTE Y ESTA ACTIVO EN LA BASE DE DATOS
    const record:RefreshToken | null = await this.refreshTokenService.findByToken({ token: refreshToken });
    
    // SI ENCONTRO Y SI EL ID NO ES IGUAL AL ID DEL PAYLOAD
    if (record && record.user.idUser !== payload.sub) {
      throw ErrorManager.createSignatureError(`UNAUTHORIZED${ESeparatorsMsgErrors.SEPARATOR}Discrepancia de usuario en el token.`);
    }

    // SI NO EXISTE O EXPIRO EN LA DB NO AUTORIZADO
    if (!record || record.expiresAt <= new Date()) {
      throw ErrorManager.createSignatureError(`UNAUTHORIZED${ESeparatorsMsgErrors.SEPARATOR}Sesión revocada.`)
    }
    
    // SI TODO ESTA BIEN DEVOLVER EL REGISTRO
    return record;
  }
}