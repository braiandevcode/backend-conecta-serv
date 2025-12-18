import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { ErrorManager } from 'src/config/ErrorMannager';
import { DeleteResult } from 'typeorm/browser';
import { FindOneByTokenDto } from './dto/findByToken.dto';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';

@Injectable()
export class RefreshTokenService {
  private readonly logger: Logger = new Logger(RefreshTokenService.name);
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // CREAR Y GUARDA UN NUEVO REFRESH TOKEN
  async create(createRefreshTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
    const { token, expiresAt, user, ip, userAgent } = createRefreshTokenDto;

    this.logger.debug(createRefreshTokenDto);

    try {
      // CREAR EL TOKEN CON DATOS
      const refresh: RefreshToken = this.refreshTokenRepository.create({
        token,
        user,
        expiresAt,
        ip: ip,
        userAgent: userAgent,
      });

      this.logger.debug(refresh);

      return this.refreshTokenRepository.save(refresh);
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BUSCAR POR EL REFRESH TOKEN
  async findByToken(tokenDto: FindOneByTokenDto): Promise<RefreshToken | null> {
    const { token } = tokenDto;
    this.logger.debug(tokenDto);

    const record = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user', 'user.rolesData'],
    });

    this.logger.debug(record);

    return record ?? null;
  }

  // BORRAR UN REFRESH TOKEN (LOGOUT POR DISPOSITIVO)
  async revokeByToken(tokenDto: FindOneByTokenDto): Promise<void> {
    const { token } = tokenDto;
    try {
      this.logger.debug(tokenDto);
      // BORRAR UN TOKEN DE LA DB DE REFRESH TOKENS
      const deleteToken: DeleteResult = await this.refreshTokenRepository.delete({ token });

      // SI NO HUBO AFECTADOS
      if (deleteToken.affected === 0) {
        this.logger.debug('NO AFECTADO');
        throw ErrorManager.createSignatureError(
          `BAD_REQUEST${ESeparatorsMsgErrors.SEPARATOR}No se encontró token para revocar`,
        );
      }
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  //REVOCA TODOS LOS TOKENS DE UN USUARIO
  async revokeAllByUser(idUser: string): Promise<void> {
    try {
      this.logger.debug(idUser);
      // BORRAR TODOS LOS TOKEN DE LA DB DE REFRESH TOKENS QUE PERTENECEN AL USUARIO CON EL ID ASOCIADO
      const deleteToken = await this.refreshTokenRepository.delete({ user: { idUser } });

      // SI NO HUBO AFECTADOS
      if (deleteToken.affected === 0) {
        this.logger.debug('NO AFECTADO');
        throw ErrorManager.createSignatureError(
          `BAD_REQUEST${ESeparatorsMsgErrors.SEPARATOR}No se encontró usuario asociado a los registros de tokens`,
        );
      }
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LIMPIAR TOKENS EXPIRADOS (USAR EN JOB/Cron)
  async removeExpired() {
    try {
      const now: Date = new Date(); //INSTANCIAR EL TIEMPO ACTUAL
      return this.refreshTokenRepository
        .createQueryBuilder()
        .delete() //BORRAR TODO
        .from(RefreshToken) //DE LA ENTIDAD "RefreshTokens"
        .where('expires_at <= :now', { now }) //DONDE SE CUMPLA CON EL CRITERIO EN QUE EL TIEMPO ACTUAL SEA MENOR O IGUAL AL DE EXPIRACION, ES DECIR YA PASO
        .execute(); //EJECUTA EL DELETE
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }
}
