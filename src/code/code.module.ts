import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { Code } from './entities/code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigResendModule } from 'src/configResend/config-resend.module';
import { CleanCodeVerifyService } from './clean-code-verify.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Code]), //TYPEORM
    // MODULO JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET_VERIFICATION_EMAIL'),
        //TIEMPO DE EXPIRACION DEL TOKEN
        signOptions: { expiresIn: '5m' },
      }),
    }),
    // MODULO CONFIGURACION EMAILJS
    ConfigResendModule,
    UserModule, //MODULO DE USERSERVICE
  ],
  controllers: [CodeController],
  providers: [CodeService, CleanCodeVerifyService],
})
export class CodeModule {}
