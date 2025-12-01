import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { iConfigDataResend } from './interface/iConfigDataResend';
@Injectable()
export class ConfigResendService {
  // EXPLICACION DE getOrThrow() DEL MODULO DE ConfigModule:
  // INDICA AL COMPILADOR TS:
  // NO ME ADVIERTAS EL UNDEFINED
  // ESTAMOS SEGUROS DE QUE EL TIPO ES EL QUE INDICAMOS Y NO ES INDEFINIDO
  // PORQUE YA VALIDAMOS SU EXISTENCIA CON JOI AL INICIAR LA APP (app.module.ts)

  constructor(private readonly configService: ConfigService) {}

  // CONFIGURAR Y LEER VARIABLES DE ENTORNO DE RESEND
  private configCredentialsResend(): iConfigDataResend {
    const DATA_RESEND: iConfigDataResend = {
      // CARGAR LA RESEND_API_KEY DESDE VARIABLE DE ENTORNO
      RESEND_API_KEY: this.configService.getOrThrow<string>('RESEND_API_KEY'), // ==> API KEY
    };
    return DATA_RESEND;
  }

  // OBTENER OBJETO DE CREDENCIALES CON GET ACCESOR
  get resendKey(): iConfigDataResend {
    return this.configCredentialsResend();
  }

  // LOS GET QUE HACEN ALGO EXTRA LOS NOMBRO COMO METODO
  public getClientInit() {
    const { RESEND_API_KEY } = this.resendKey; // DESESTRUCTURO OBJETO

    // ESTE OBJETO ES EL QUE PASARAS AL SERVICIO DE ENVÍO
    return { apiKey: RESEND_API_KEY };
  }
}

