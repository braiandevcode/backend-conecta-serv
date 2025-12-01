import { Injectable, Req } from '@nestjs/common';
import { RefreshTokenService } from './refresh-tokens.service';
import { Interval } from '@nestjs/schedule';
import { ONE_WEEK_IN_MS } from 'src/auth/constants/timeExpiration';

// https://docs.nestjs.com/techniques/task-scheduling
// PARA ENTENDER PATRON
// ┌────────────── segundo (opcional)
// │ ┌──────────── minuto
// │ │ ┌────────── hora
// │ │ │ ┌──────── día del mes
// │ │ │ │ ┌────── mes
// │ │ │ │ │ ┌──── día de la semana
// * * * * *
// O @Cron('0 0 * * 0') 

@Injectable()
export class CleanRefreshTokenCronService {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}
    //CRON TAREA PROGRAMADA QUE SE EJECUTA AUTOMATICAMENTE CADA CIERTO HORARIO
    // SIN QUE NADIE LLAME A UN ENDPOINT
    @Interval(ONE_WEEK_IN_MS)
    async handleCron() {
      await this.refreshTokenService.removeExpired();
    }
}
