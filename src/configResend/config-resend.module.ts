import { Module } from '@nestjs/common';
import { ConfigResendService } from './config-resend.service';

@Module({
    providers:[ConfigResendService],
    exports:[ConfigResendService]
})
export class ConfigResendModule {}
