import {  Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { iJwtPayload } from './interface/iJwtPayload';
import { RefreshTokenService } from 'src/refresh-tokens/refresh-tokens.service';
import { LoginDto } from './dto/login-dto';
import argon2 from 'argon2';
import { User } from 'src/user/entities/user.entity';
import { ONE_WEEK_IN_MS } from './constants/timeExpiration';
import { iAccessToken } from './interface/iAccessToken';
import { TDataPayloadUser } from 'src/types/typeDataPayloadUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UserService,
  ) {}

  // VALIDAR CREDENCIALES MEDIANTE PASSPORT ESTE METODO ES LLAMADO EN EL SERCIO DE ESTRATEGIA DE PASSPORT
  async validateUser(loginDto: LoginDto): Promise<iJwtPayload | null> {
    const { userName, password } = loginDto;

    // BUSCAR EL USUARIO ACTIVO POR USERNAME O EMAIL
    const user: User | null = await this.userService.findByUserNameActiveForAuth({ userName });

    // SI NO EXISTE EL USUARIO, RETORNAR NULL PARA QUE PASSPORT MANEJE EL 401
    if (!user) return null;

    // OBTENER LA CONTRASEÑA HASHEADA DEL USUARIO
    const hashedPassword: string = user.password;

    // VERIFICAR (DIGIERE) LA CONTRASEÑA QUE VIENE DE LA DB CON ARGON2
    const isMatch: boolean = await argon2.verify(hashedPassword, password);

    // SI LA CONTRASEÑA NO COINCIDE, RETORNAR NULL
    if (!isMatch) return null;

    // CONSTRUIR EL PAYLOAD LIMPIO PARA EL JWT
    const payload: iJwtPayload = {
      sub: user.idUser, // ID DEL USUARIO
      userName: user.userName, // NOMBRE DE USUARIO
      email: user.email, // EMAIL (OPCIONAL)
      roles: user.rolesData.map((role) => role.nameRole), // ARRAY DE NOMBRES DE ROLES
    };

    // RETORNAR EL PAYLOAD LIMPIO
    return payload;
  }

  // SIGN IN: GENERA ACCESS TOKEN + REFRESH Y GUARDA EL REFRESH EN DB
  async signIn(userPayload: iJwtPayload, ip?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    // GENERAR ACCESS TOKEN
    const accessToken: string = this.jwtService.sign(userPayload, { expiresIn: '15m'});
    
    // CONFIGURAR REFRESH TOKEN
    /*
      - JWT_SECRET_REFRESH  ==> LLAVE SECRETA DISTINTA QUE FIRMARA LOS REFRESH TOKENS. ASI SI ALGUIEN ROBA UN ACCESS TOKEN, NO PUEDE USARLO PARA CREAR REFRESH TOKENS.
      - JWT_EXPIRES_REFRESH ==>  TIEMPO DE EXPIRACION PARA LOS REFRESH TOKENS. ES MAS LARGO QUE EL ACCESS TOKEN.
    */

    // LEEMOS VARIABLES PARA GENERAR EL REFRESH TOKEN
    const refreshSecret: string = this.configService.getOrThrow<string>('JWT_SECRET_REFRESH');
    const refreshExpires: string = this.configService.getOrThrow<string>('JWT_EXPIRES_REFRESH');

    // TOMAR SOLO EL SUBJECT
    const payload: { sub: string } = { sub: userPayload.sub };

    // GENERAR REFRESH TOKEN CON JWT MEDIANTE EL METODO SIGN
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    } as JwtSignOptions);

    // CALCULAR FECHA DE EXPIRACION PARA DB
    const expiresAt: Date = new Date();

    // SETEAR EN EXPIRES AT EL MOMENTO ACTUAL
    expiresAt.setTime(Date.now() + ONE_WEEK_IN_MS);

    // OBTENER ENTIDAD USER
    const user: User | null = await this.userService.findByUserNameActiveForAuth({ userName: userPayload.userName });
    
    if (!user) return null; //PASSPORT RETORNA EL 401
    
    // GUARDAR REFRESH TOKEN EN DB
    await this.refreshTokenService.create({
      token: refreshToken,
      user,
      expiresAt,
      ip,
      userAgent,
    });

    // RETORNAR AMBOS ACCESS Y REFRESH
    return { accessToken, refreshToken } as {
      accessToken: string;
      refreshToken: string;
    };
  }

  // VER DATOS DEL USUARIO LOGEADO
  async getUserData(payload: iJwtPayload):Promise<TDataPayloadUser| null> {
    return await this.userService.getUserData(payload);
  }

  // LA FUNCION RECIBE EL OBJETO USER VALIDADO POR EL GUARD
  async refreshAccessToken(user: User): Promise<iAccessToken> {
    // NUEVO PAYLOAD
    const payload: iJwtPayload = {
      sub: user.idUser,
      userName: user.userName,
      email: user.email,
      roles: user.rolesData.map((r) => r.nameRole),
    };

    // CREAR NUEVO ACCESS TOKEN
    const accessToken: string = this.jwtService.sign(payload);

    return { accessToken }; //RETORNAR OBJETO CON TOKEN NUEVO
  }

  // LOGOUT: BORRAR UN REFRESH TOKEN (RECIBIDO DESDE FRONT)
  async logout(refreshToken: string):  Promise<void> {
    return await this.refreshTokenService.revokeByToken({ token: refreshToken });
  }

  // CERRAR SESION EN TODOS LOS DISPOSITIVOS
  async logoutAll(idUser: string): Promise<void> {
    return this.refreshTokenService.revokeAllByUser(idUser);
  }
}
