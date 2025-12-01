import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-tokens.service';
import { CleanRefreshTokenCronService } from './clean-refresh-token-cron.service';

@Module({
  imports:[TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenService,CleanRefreshTokenCronService],
  exports:[RefreshTokenService]
})
export class RefreshTokensModule {}
