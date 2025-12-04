import {
  Controller,
  Post,
  Req,
  UseGuards,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { CookieOptions, Request, Response } from 'express';
import { iJwtPayload } from './interface/iJwtPayload';

import { iAccessToken } from './interface/iAccessToken';
import { RefreshToken } from 'src/refresh-tokens/entities/refresh-token.entity';
import { User } from 'src/user/entities/user.entity';
import { TDataPayloadUser } from 'src/types/typeDataPayloadUser';
import { ConfigAuthCookie } from './constants/configAuth.service';


// CON passthrough: true, Nest PERMITE USAR res.cookie() PERO SEGUIR DEVOLVIENDO UN RETURN NORMALMENTE
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configAuthService:ConfigAuthCookie) {}

  // LOGIN CON USERNAME Y PASSWORD
  @Post('/login')
  @UseGuards(AuthGuard('local')) // USA PASSPORT PARA VALIDAR USUARIO Y CONTRASEÑA, EJECUTA PASSPORT LocalStrategy.
  async login(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<iAccessToken | null> {
    // OBTENER OBJETO DEL USUARIO VALIDADO POR PASSPORT
    const user = req.user as iJwtPayload;
    
    // OBTENER IP Y USER-AGENT (OPCIONAL) PARA GUARDAR EN REFRESH TOKEN
    const ip: string | undefined = req.ip;

    const userAgent: string | undefined = req.headers['user-agent'];

    // LLAMAR A SERVICE PARA GENERAR ACCESS + REFRESH TOKEN
    const data: { accessToken: string; refreshToken: string } | null =
      await this.authService.signIn(user, ip, userAgent);

    if (!data) return null;

    const { accessToken, refreshToken } = data;

    // LLAMO AL SERVICIO DE CONFIGURACION DE COOKIE
    const configAuthCookie:CookieOptions = this.configAuthService.configurationHttpOnlyCookieParser(); 

    // CONFIGURO LA COOKIE
    res.cookie('refresh_token', refreshToken, configAuthCookie);

    // RETORNAMOS EL TOKEN DE ACCESO
    return { accessToken } as iAccessToken;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getDataUser(@Req() req: Request):Promise<TDataPayloadUser | null> {
    return await this.authService.getUserData(req.user as iJwtPayload);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh')) // CORREGIR COMENTARIO: EL GUARD EJECUTA 'jwt-refresh'.
  async refresh(@Req() req: Request): Promise<iAccessToken> {
    //OBTENER El REGISTRO VALIDADO DE LA DB QUE DEVUELVE LA ESTRATEGIA 'jwt-refresh'
    const record = req.user as RefreshToken;

    const user: User = record.user; // OBTENER EL OBJETO USER DESDE EL REGISTRO

    //LLAMAR AL SERVICIO CON EL OBJETO USER
    const result: iAccessToken = await this.authService.refreshAccessToken(user);

    // RETORNAR TOKEN
    return { accessToken: result.accessToken };
  }

  // LOGOUT ==> REVOCAR UN REFRESH TOKEN
  @Post('/logout')
  async logout(@Req() req: Request): Promise<void> {
    const refreshToken = req.cookies['refresh_token'];
    // LLAMAR AL SERVICE PARA ELIMINAR EL REFRESH TOKEN DE LA DB
    return this.authService.logout(refreshToken);
  }

  // CERRAR SESION EN TODOS LOS DISPOSITIVOS
  @Post('/logout-all')
  async logoutAll(@Req() req: Request) {
    const user = req?.user as iJwtPayload;
    await this.authService.logoutAll(user.sub);
  }
}
