import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserIdentifyEmailDto } from './dto/user-identify-email-dto';
import { iMessageResponseStatus } from 'src/code/interface/iMessagesResponseStatus';
import { AuthGuard } from '@nestjs/passport';
import { iJwtPayload } from 'src/auth/interface/iJwtPayload';
import { TActiveTaskerUser } from 'src/types/typeDataTaskersProfile';
import { TDataPayloadTaskerSingle } from 'src/types/typeDataPayloadTaskerSingle';

@Controller('api/v1')
export class UserController {
  private readonly logger:Logger = new Logger(UserController.name)
  constructor(private readonly userService: UserService) {}

  @Post('/users')
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.debug('BODY DE CONTROLAOR DE USER: ', createUserDto)
    
    //LLAMAR AL SERVICIO
    return this.userService.create(createUserDto,);
  }

  // USUARIOS ACTIVOS LOGEADOS
  @Get('users/actives')
  @UseGuards(AuthGuard('jwt'))
  async getActiveUsers(@Req() req: Request & { user: iJwtPayload }): Promise<TActiveTaskerUser[]> {
    const userId = req.user.sub;
    return this.userService.getAllActiveUsersTaskerProfile(userId);
  }

  // IDENTIFICAR UN USUARIO POR SU EMAIL
  @Post('/users/identify')
  async getUserEmailActive(
    @Body() userIdentifyEmailDto: UserIdentifyEmailDto,
  ): Promise<iMessageResponseStatus> {
    return await this.userService.getUserEmailActive(userIdentifyEmailDto);
  }

  // ENDPOINT PARA UN USUARIO COMUN (CLIENTE) VER PERFIL DE TASKER POR SELECCION
  @Get('/users/tasker/:idTasker/details')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('idTasker') idTasker: string): Promise<TDataPayloadTaskerSingle | null> {
    return await this.userService.getTaskerSingle(idTasker);
  }

  // ELIMNAR DE FORMA FISICA UN USUARIO SIN IMPLEMENTAR
  @Delete('/users/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
