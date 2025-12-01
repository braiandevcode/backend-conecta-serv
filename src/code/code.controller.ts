import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CodeService } from './code.service';
// import { UpdateCodeDto } from './dto/update-code.dto';
import { RequestCodeDto } from './dto/request-code-dto';
import { VerifyCodeDto } from './dto/verify-code-dto';
import { iMessageStausToken } from './interface/iMessageStatusToken';
import { iMessageResponseStatus } from './interface/iMessagesResponseStatus';

@Controller('api')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}
 
  //PROCESO DE SOLICITUD AL SERVICIO EXTERNO RESEND
  @Post('/v1/code/request')
  requestCode(@Body() createCodeDto: RequestCodeDto): Promise<iMessageStausToken> {
    return this.codeService.requestCode(createCodeDto);
  }
  //PROCESO DE VERIFICACION DEL CODIGO
  @Post('/v1/code/verify')
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto):Promise<iMessageResponseStatus> { 
    return this.codeService.verifyCode(verifyCodeDto); 
  }
}
