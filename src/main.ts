import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [`${process.env.FE_HOST}`, /\.vercel\.app$/,], // FRONTEND
    credentials: true, // SI SE USA COOKIES / HEADERS
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });
 
  // ES UN MIDDLEWARE DE COOKIES
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
