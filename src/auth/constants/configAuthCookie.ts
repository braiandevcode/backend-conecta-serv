import { CookieOptions } from 'express';
import { ONE_WEEK_IN_MS } from './timeExpiration';


// INVESTIGADO EN : https://www.npmjs.com/package/cookie
// CONFIGURACION DE COOKIE PARA AUTENTICACION
export const configAuthCookie: CookieOptions = {
  httpOnly: true, //NO PERMITE QUE SE LEA EN NAVEGADOR CLIENTE MEDIANTE document.cookie,
  path: '/', //RUTA PARA ESTA ASIGNACION
  maxAge: ONE_WEEK_IN_MS, //EXPIRACION DE COOKIE
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // SI ESTA EN PRODUCCION SERA ESTRICTO SINO LAX
  secure: process.env.NODE_ENV === 'production', //SEGURIDAD CON HTTPS SI ESTA EN PRODUCCION
};
