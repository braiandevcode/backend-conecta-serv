import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { Role } from 'src/role/entities/role.entity';
import { Location } from 'src/location/entities/location.entity';
import { instanceToPlain } from 'class-transformer';
import { TaskersService } from 'src/tasker/taskers.service';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import { hash } from 'argon2';
import { LocationsService } from 'src/location/locations.service';
import { RoleService } from 'src/role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryRunner } from 'typeorm/browser';
import { UserIdentifyEmailDto } from './dto/user-identify-email-dto';
import { iMessageResponseStatus } from 'src/code/interface/iMessagesResponseStatus';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';
import { iJwtPayload } from 'src/auth/interface/iJwtPayload';
import { TDataPayloadUser } from 'src/types/typeDataPayloadProfile';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  // LO PRIMERO QUE SIEMPRE SE EJECUTARA
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>, // REPOSITORIO DE USUARIOS
    private readonly taskerService: TaskersService, //SERVICIO TASKER
    private readonly locationService: LocationsService, //SERVICIO LOCATIONS
    private readonly roleService: RoleService, //SERVICIO ROLES
    private readonly dataSource: DataSource,
  ) {}

  // CREAR DATOS BASICOS DE USUARIO (DEFAULT ROL CLIENTE)
  async create(
    fileProfile: Express.Multer.File | null,
    filesExp: Express.Multer.File[],
    createUserDto: CreateUserDto,
  ): Promise<Record<string, Omit<User, 'password'>>> {
    // DESESTRUCTURO LOS DATOS QUE LLEGAN DEL FRONTEND
    const { email, userName, locationData, roleData, taskerData, password, ...restOfUserDto } =
      createUserDto;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // ==> CONEXION
    await queryRunner.startTransaction(); // ==> INICIO DE LA TRANSACCIÓN

    try {
      // VERIFICAR SI EL USUARIO YA EXISTE Y SI EL ACTIVE ESTA EN TRUE
      // BUSCO EN LA TABLA DE USUARIOS POR EMAIL
      const existingUser: User | null = await queryRunner.manager.findOne(User, {
        where: [
          { email: email }, // EXISTE UN USUARIO CON ESTE EMAIL
          { userName: userName }, // O EXISTE UN USUARIO CON ESTE USERNAME
        ],
      });

      // SI EMAIL YA EXISTE
      if (existingUser) {
        // SI YA EXISTE, LANZO UN ERROR CONTROLADO
        // ESTO AYUDA A QUE EL FRONTEND PUEDA SABER QUE YA ESTA REGISTRADO  ==> CODIGO 409
        ErrorManager.createSignatureError(
          `CONFLICT${ESeparatorsMsgErrors.SEPARATOR}El usuario o email ya está registrado.`,
        );
      }

      // LLAMO AL SERVICIO QUE HACE LA CREACION Y VALIDACION EN SU MODULO PARA SU ENTIDAD
      const locationEntity: Location = await this.locationService.findOrCreate(
        locationData,
        queryRunner.manager,
      );

      const roleEntity: Role[] = await this.roleService.findOrCreate(
        roleData.role,
        queryRunner.manager,
      );

      const hashedPassword: string = await hash(password);

      // CREAR LA ENTIDAD USUARIO
      // AQUI ARMAMOS EL OBJETO USER CON TODOS LOS DATOS DEL FRONTEND
      // INCLUIMOS LA LOCALIDAD Y EL ROL QUE ACABAMOS DE OBTENER
      const user: User = queryRunner.manager.create(User, {
        ...restOfUserDto,
        userName,
        email,
        password: hashedPassword, //==> HASHEAR CONTRASEÑA
        locationData: locationEntity,
        rolesData: roleEntity, // ASIGNO UN ARRAY CON EL ROL
      });

      // GUARDAR EL USUARIO EN LA BASE DE DATOS
      // TYPEORM AUTOMATICAMENTE GUARDA LA RELACION EN LA TABLA INTERMEDIA
      const savedUser: User = await queryRunner.manager.save(user);

      //PREGUNTO QUE ROL VIENE, PARA SABER SI DEBE CONTINUAR CON MAS DATOS QUE SE AGREGARIAN EN TASKERS Y SUS RELACIONES
      // O SIMPLEMENTE SON LOS DATOS BASICOS DE UN CLIENTE
      let tasker: Tasker | null = null;
      if (roleData.role === 'tasker' && taskerData) {
        tasker = await this.taskerService.create(
          fileProfile,
          filesExp,
          taskerData,
          queryRunner.manager,
        );

        savedUser.taskerData = tasker; // ASIGNAR EL TASKER COMPLETO A LA RLACION

        // DECIRLE A TYPEORM QUE ACTUALIZE LA FK id_tasker EN USER
        await queryRunner.manager.save(savedUser);
      }

      // SI E ROL ES TASKER PERO NO VIENEN DATOS NO CONTINUAR
      if (roleData.role === 'tasker' && !taskerData) {
        ErrorManager.createSignatureError(
          `INTERNAL_SERVER_ERROR${ESeparatorsMsgErrors.SEPARATOR}El usuario fue registrado con rol "tasker" pero la entidad Tasker no se asoció correctamente.`,
        );
        await queryRunner.rollbackTransaction(); // ROLLBACK: SI ALGO FALLA DESHACE  ==> User y Tasker.
      }

      await queryRunner.commitTransaction(); // COMMIT ==> SI TODO FUNCIONO GUARDAR.

      const userPlain = instanceToPlain(savedUser);

      // DEVOLVEMOS EL RESULTADO
      return userPlain;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // ROLLBACK: SI ALGO FALLA DESHACE  ==> User y Tasker.
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    } finally {
      await queryRunner.release(); // CIERRA EL => QueryRunner
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  // BUSCAR SOLO EL EMAIL EN LA TABLA USERS SIN CRITERIOS DE ACTIVO O NO
  async getUserEmail({ email }: { email: string }): Promise<User | null> {
    try {
      // CONSULTA
      const resultFindOneByEmail: User | null = await this.userRepository.findOne({
        where: { email },
        select: ['email'], //BUSCAR SOLO EN LA COLUMNA EMAIL
      });

      return resultFindOneByEmail;
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;

      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BUSCAR SOLO EL EMAIL EN LA TABLA USERS DE USUARIOS ACTIVOS
  async getUserEmailActive(
    userIdentifyEmailDto: UserIdentifyEmailDto,
  ): Promise<iMessageResponseStatus> {
    try {
      // CONSULTA
      const resultQuery: User | null = await this.userRepository.findOne({
        where: { email: userIdentifyEmailDto.emailIdentify, active: true },
        select: ['email', 'active'], //BUSCAR SOLO EN LA COLUMNA EMAIL
      });

      // SI HAY RESULTADOS, PERO NO QUIERO RETORNAR EL OBJETO DE DATOS SOLO MENSAJE AL FRONT
      if (resultQuery) {
        throw ErrorManager.createSignatureError(
          `CONFLICT${ESeparatorsMsgErrors.SEPARATOR}El email ya existe`,
        );
      }

      return { message: 'Exito', success: true, status: HttpStatus.OK };
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BUSCAR SOLO EL USUARIO EN LA TABLA USERS DE USUARIOS ACTIVOS
  async findByUserNameActiveForAuth({ userName }: { userName: string }): Promise<User | null> {
    try {
      // CONSULTA
      const resultQuery: User | null = await this.userRepository.findOne({
        where: [
          { email: userName, active: true },
          { userName: userName, active: true },
        ],
        relations: ['rolesData'],
        select: ['idUser', 'email', 'userName', 'password', 'active'],
      });

      // SI ES NULL RETORNAR NULO LIBRERIA PASSPORT MANEJA ESE CASO
      if (!resultQuery) return null;

      return resultQuery;
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  //LEER DATOS DEL USUARIO PARA CARGAR DATOS LUEGO DEL LOGIN
  async getUserData(payload: iJwtPayload): Promise<TDataPayloadUser | null> {
    try {
      const userId = payload.sub;

      const user: User | null = await this.userRepository.findOne({
        where: { idUser: userId, active: true },
        relations: [
          'rolesData',
          'locationData',
          'taskerData',
          'taskerData.servicesData',
          'taskerData.workAreasData',
          'taskerData.daysData',
          'taskerData.hoursData',
          'taskerData.categoryData',
          'taskerData.budgetData',
          'taskerData.imageProfile',
          'taskerData.imageExperience',
        ],
      });

      if (!user) return null;

      const isTasker: boolean = user.rolesData.some(r => r.nameRole === 'tasker');

      return {
        sub: user.idUser,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        roles: user.rolesData.map(r => r.nameRole),
        isTasker,
        // SOLO SI ES TASKER, con arrays vacíos si no hay datos
        days: isTasker ? user.taskerData?.daysData?.map(d => d.dayName || '') || [] : [],
        hours: isTasker ? user.taskerData?.hoursData?.map(h => h.hourName || '') || [] : [],
        services: isTasker
          ? user.taskerData?.servicesData?.map(s => s.serviceName || '') || []
          : [],
        worksArea: isTasker
          ? user.taskerData?.workAreasData?.map(w => w.workAreaName || '') || []
          : [],
        category: isTasker ? user.taskerData?.categoryData?.categoryName || '' : '',
        budget: isTasker ? user.taskerData?.budgetData || null : null,
        description: isTasker ? user.taskerData?.description || '' : '',
      } as TDataPayloadUser;
    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LEER TASKERS ACTIVOS
  async getActiveUsers(excludeUserId: string): Promise<TDataPayloadUser[]> {
    try {
      // USO DE QUERY BUILDER PARA CONSULTAS N:N O N:1 QUE SON COMPLEJAS EN BUSQUEDAS
      // LEER TASKERS ACTIVOS - VERSIÓN CORREGIDA Y OPTIMIZADA
      const taskers: User[] = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.rolesData', 'role')
        .leftJoinAndSelect('user.taskerData', 'taskerData')
        .leftJoinAndSelect('taskerData.servicesData', 'services')
        .leftJoinAndSelect('taskerData.workAreasData', 'worksArea')
        .leftJoinAndSelect('taskerData.daysData', 'days')
        .leftJoinAndSelect('taskerData.hoursData', 'hours')
        .leftJoinAndSelect('taskerData.categoryData', 'category')
        .leftJoinAndSelect('taskerData.budgetData', 'budget')

        .leftJoin('taskerData.imageProfile', 'imageProfile')
        .leftJoin('taskerData.imageExperience', 'imageExperience')
        .select([
          'user', 
          'role.nameRole',
          'taskerData',
          'services',
          'worksArea',
          'days',
          'hours',
          'category',
          'budget',
          'imageProfile.idProfile', 
          'imageExperience.idExperience', 
        ])

        .where('user.idUser != :excludeUserId', { excludeUserId })
        .andWhere('user.active = true')
        .andWhere('role.nameRole = :role', { role: 'tasker' })
        .getMany();

      // SI NO HAY LONGITUD
      if (taskers.length === 0) {
        return []; // SOLO ARRAY VACIO
      }

      // MAPEAR EL FORMATO TDataPayloadUser
      return taskers.map(
        user =>
          ({
            sub: user.idUser,
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            roles: user.rolesData.map(r => r.nameRole),
            isTasker: true,
            days: user.taskerData?.daysData?.map(d => d.dayName) || [],
            hours: user.taskerData?.hoursData?.map(h => h.hourName) || [],
            services: user.taskerData?.servicesData?.map(s => s.serviceName) || [],
            worksArea: user.taskerData?.workAreasData?.map(w => w.workAreaName) || [],
            category: user.taskerData?.categoryData?.categoryName || '',
            budget: user.taskerData?.budgetData || null,
            profileImageId: user.taskerData?.imageProfile?.idProfile || null,
            experienceImageIds:
              user.taskerData?.imageExperience?.map(img => img.idExperience) || [],
          }) as TDataPayloadUser,
      );
    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
