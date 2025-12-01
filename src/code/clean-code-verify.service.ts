import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CodeService } from './code.service';

@Injectable()
export class CleanCodeVerifyService {
    constructor(private readonly codeService:CodeService){}
    @Cron('0 0 * * *') 
    async handleCleanCode(){
        await this.codeService.removeExpiredAndUsed();
    }
}
