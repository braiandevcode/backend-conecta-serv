import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/multer.options';
import { TotalSizeValidationPipe } from 'src/shared/pipes/total-size-validation.pipe';
import { ParseJsonPipe } from 'src/shared/pipes/parse-json.pipe';
import { UserIdentifyEmailDto } from './dto/user-identify-email-dto';
import { iMessageResponseStatus } from 'src/code/interface/iMessagesResponseStatus';
import { AuthGuard } from '@nestjs/passport';
import { iJwtPayload } from 'src/auth/interface/iJwtPayload';
import { TActiveTaskerUser } from 'src/types/typeDataTaskersProfile';

@Controller('api/v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/users')
  // INTERCEPTAR AMBOS CAMPOS
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageProfile', maxCount: 1 }, // EL CAMPO DEL PERFIL
        { name: 'imageExperiences', maxCount: 10 }, // CAMPO DE EXPERIENCIAS HASTA 10
      ],
      multerOptions,
    ),
  )
  create(
    // RECUPERA UN OBJETO CON TODOS LOS CAMPOS SEPARADOS POR NOMBRE.
    @UploadedFiles()
    files: {
      imageProfile?: Express.Multer.File[];
      imageExperiences?: Express.Multer.File[];
    },
    @Body(
      'data',
      ParseJsonPipe,
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    createUserDto: CreateUserDto,
  ) {
    const profileFile: Express.Multer.File | null = files.imageProfile?.[0] || null;
    const experienceFiles: Express.Multer.File[] = files.imageExperiences || [];

    // EXTRAER Y APLICAR EL PIPE SOLO EN IMAGENES DE EXPERIENCIAS
    const validatedExperienceFiles: Express.Multer.File[] = new TotalSizeValidationPipe().transform(experienceFiles);
    //LLAMAR AL SERVICIO
    return this.userService.create(
      profileFile, //ARCHIVO PERFIL
      validatedExperienceFiles, //ARCHIVOS EXPERIENCIAS VALIDADOS
      createUserDto,
    );
  }

  // USUARIOS ACTIVOS LOGEADOS
  @Get('users/actives')
  @UseGuards(AuthGuard('jwt'))
  async getActiveUsers(@Req() req: Request & { user: iJwtPayload }): Promise<TActiveTaskerUser[]> {
    const userId = req.user.sub;
    return this.userService.getActiveUsersTasker(userId);
  }

  // IDENTIFICAR UN USUARIO POR SU EMAIL
  @Post('/users/identify')
  async getUserEmailActive(
    @Body() userIdentifyEmailDto: UserIdentifyEmailDto,
  ): Promise<iMessageResponseStatus> {
    return await this.userService.getUserEmailActive(userIdentifyEmailDto);
  }

  // LEER TODOS LOS USUARIOS (SIN IMPLEMENTAR)
  @Get('/users')
  findAll() {
    return this.userService.findAll();
  }

  // BUSCAR USUARIO POR ID (SIN IMPLEMENTAR)
  @Get('/users/:id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // ELIMNAR DE FORMA FISICA UN USUARIO SIN IMPLEMENTAR
  @Delete('/users/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
