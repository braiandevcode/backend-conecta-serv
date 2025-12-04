import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { UserModule } from 'src/user/user.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ConfigAuthCookie } from './constants/configAuth.service';

@Module({
  imports:[
    ConfigModule,
    PassportModule,
    RefreshTokensModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET_AUTH'),
        //TIEMPO DE EXPIRACION DEL TOKEN 
        signOptions: { expiresIn: configService.getOrThrow('JWT_EXPIRES_AUTH') },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, ConfigAuthCookie],
  controllers: [AuthController],
})
export class AuthModule {}
