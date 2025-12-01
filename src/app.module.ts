import { ServicesModule } from './service/services.module';
import { UserModule } from './user/user.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { WorkAreaModule } from './work-area/workArea.module';
import { HourModule } from './hour/hour.module';
import { DayModule } from './day/day.module';
import { ProfileModule } from './profile/profile.module';
import { BudgetModule } from './budget/budget.module';
import { LocationsModule } from './location/locations.module';
import { CategoryModule } from './category/category.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from './role/role.module';
import { CodeModule } from './code/code.module';
import Joi from 'joi';
import { ConfigResendModule } from './configResend/config-resend.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // CONFIGURACION DE MODULO PARA VARIABLE DE ENTORNOS
    ConfigModule.forRoot({
      // CARGA VARIABLES DE ENTORNO DESDE ARCHIVO .ENV
      isGlobal: true, // DISPONIBLE EN TODA LA APP SIN VOLVER A IMPORTAR
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`, // ARCHIVO .ENV SEGUN EL ENTORNO
      //ACTUALIZACIÓN DEL ESQUEMA DE JOI
      validationSchema: Joi.object({
        //VARIABLES ENTORNO BASE DE DATOS
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        // JWT VERIFICACION DE EMAIL
        JWT_SECRET_VERIFICATION_EMAIL:Joi.string().required(),
        // JWT AUTENTICACION DE USUARIO
        JWT_SECRET_AUTH:Joi.string().required(),
        //TIEMPO DE EXPIRACION DADO
        JWT_EXPIRES_AUTH:Joi.string().required(),
        // JWT REFRESH
        JWT_SECRET_REFRESH:Joi.string().required(),
        JWT_EXPIRES_REFRESH:Joi.string().required(),
        RESEND_API_KEY:Joi.string().required(),
        // DOMINIO + PUERTO
        FE_HOST:Joi.string().required(),
      }),
    }),
    // CONECTAR BASE DE DATOS
    TypeOrmModule.forRootAsync({
      // CONFIGURA TYPEORM DE FORMA ASÍNCRONA (PERMITE USAR CONFIGSERVICE)
      imports: [ConfigModule], // IMPORTA CONFIGMODULE PARA PODER USAR VARIABLES DE ENTORNO
      inject: [ConfigService], // INYECTA CONFIGSERVICE DENTRO DEL useFactory
      useFactory: (config: ConfigService) => ({
        // FUNCIÓN QUE DEVUELVE LA CONFIG DE LA DB
        type: 'mysql', // TIPO DE BASE DE DATOS
        host: config.get<string>('DB_HOST'), // HOST DE LA DB
        port: config.get<number>('DB_PORT'), // PUERTO DE LA DB
        username: config.get<string>('DB_USERNAME'), // USUARIO DE LA DB
        password: config.get<string>('DB_PASSWORD'), // PASSWORD DE LA DB
        database: config.get<string>('DB_NAME'), // NOMBRE DE LA BASE DE DATOS
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // ENTIDADES QUE VA A LEER
        synchronize: false // AUTO SINCRONIZA SCHEMA (EN TRUE NO USAR EN PRODUCCIÓN)
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'assets'),
      serveRoot: '/assets' 
    }),
    //CROS INICIALIZA EL PLANIFICADOR. 
    // REGISTRA CUALQUIER CRON JOB TIMEOUT O INTERVALO QUE EXISTA DENTRO DE LA APP.
    ScheduleModule.forRoot(),
    ServicesModule,
    AuthModule,
    UserModule,
    ExperiencesModule,
    WorkAreaModule,
    HourModule,
    DayModule,
    ProfileModule,
    BudgetModule,
    LocationsModule,
    CategoryModule,
    RoleModule,
    CodeModule,
    ConfigResendModule,
    RefreshTokensModule,
  ],
})
export class AppModule {}
