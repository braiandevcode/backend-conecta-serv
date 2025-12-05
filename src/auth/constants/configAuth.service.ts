import { ONE_WEEK_IN_MS } from './timeExpiration';
import { Injectable, Logger } from '@nestjs/common';
import { CookieOptions } from 'express';

// INVESTIGADO EN : https://www.npmjs.com/package/cookie
// CONFIGURACION DE COOKIE PARA AUTENTICACION

@Injectable()
export class ConfigAuthCookie {
  constructor() {}

  public configurationHttpOnlyCookieParser(): CookieOptions {
    const configAuthCookie: CookieOptions = {
      httpOnly: true, //NO PERMITE QUE SE LEA EN NAVEGADOR CLIENTE MEDIANTE document.cookie,
      path: '/', //RUTA PARA ESTA ASIGNACION
      maxAge: ONE_WEEK_IN_MS, //EXPIRACION DE COOKIE
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none', // SI ESTA EN PRODUCCION SERA ESTRICTO SINO LAX
      secure: process.env.NODE_ENV === 'production', //SEGURIDAD CON HTTPS SI ESTA EN PRODUCCION
    };
    return configAuthCookie;
  }
}
