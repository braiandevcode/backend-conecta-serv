import { IsOptional, IsString, IsDate } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreateRefreshTokenDto {
  user: User; // USUARIO AL QUE PERTENECE
  @IsString()
  token: string; // TOKEN ÚNICO
  @IsDate()
  expiresAt: Date; // FECHA DE EXPIRACIÓN
  @IsOptional()
  @IsString()
  ip?: string; // IP OPCIONAL
  @IsOptional()
  @IsString()
  userAgent?: string; // USER AGENT OPCIONAL
}

