import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Equal, IsNull, Not, Repository } from 'typeorm';
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
import { TDataPayloadUser } from 'src/types/typeDataPayloadUser';
import { TActiveTaskerUser } from 'src/types/typeDataTaskersProfile';
import { TDataPayloadTaskerSingle } from 'src/types/typeDataPayloadTaskerSingle';
import { TBudgetData } from 'src/types/typeBudgetData';

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

  //MOSTAR USUARIOS QUE ESTEN ACTIVOS POR NOMBRE DE USUARIO
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

  //LEER DATOS DEL USUARIO QUE HACE LOGIN
  async getUserData(payload: iJwtPayload): Promise<TDataPayloadUser | null> {
    try {
      const userId: string = payload.sub;

      this.logger.debug(userId);

      const user: User | null = await this.userRepository.findOne({
        where: { idUser: userId, active: true },
        relations: [
          'rolesData',
          'locationData',
          'taskerData',
          'taskerData.servicesData',
          'taskerData.workAreasData',
          'taskerData.imageExperience', //BUSCAR EXPLICITAMENTE ES "CARGA PEREZOSA" UNO A MUCHO O MUCHOS A MUCHOS
          'taskerData.daysData',
          'taskerData.hoursData',
          'taskerData.categoryData',
          'taskerData.budgetData',
        ],
      });

      // NOTA: EN PERFIL NO, UNO A UNO O MUCHOS A UNO "CARGA ANCIOSA"

      this.logger.debug(user);

      if (!user) return null;

      const isTasker: boolean = user.rolesData.some(r => r.nameRole === 'tasker');

      this.logger.debug(isTasker);

      // RETORNAR
      const dataUser: TDataPayloadUser = {
        sub: user.idUser,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        roles: user.rolesData?.map(r => ({
          idRole: r.idRole,
          nameRole: r.nameRole,
        })),

        isTasker, //SI ES TASKER
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
        profileImageUrl: isTasker
          ? `api/v1/tasker/profile/${user.taskerData?.idTasker}/image`
          : null,
        experienceImagesUrl: user.taskerData?.imageExperience
          ? user.taskerData.imageExperience.map(
              img => `api/v1/tasker/experience/${img.idExperience}/image`,
            )
          : [],
      };

      this.logger.debug(dataUser);

      return dataUser;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LEER USUARIOS TASKERS ACTIVOS
  async getAllActiveUsersTaskerProfile(sub: string): Promise<TActiveTaskerUser[]> {
    try {
      const users = await this.userRepository.find({
        where: {
          idUser: Not(sub),
          active: true,
          taskerData: Not(IsNull()),
        },
        relations: [
          'rolesData',
          'taskerData',
          'taskerData.budgetData',
          'taskerData.servicesData',
          'taskerData.workAreasData',
          'taskerData.daysData',
          'taskerData.hoursData',
          'taskerData.categoryData',
        ],
      });

      this.logger.debug(users);

      // USUARIOS ACTIVOS CON ROL TASKER
      const allDataUsers: TActiveTaskerUser[] = users.map(u => {
        // DEFINIR ANTES PARA EVITAR PROBLEMAS DE TIPOS EN OBJETO A RETORNAR
        const sectionBudget: TBudgetData = {
          idBudget: u.taskerData.budgetData?.idBudget ?? null,
          amount: u.taskerData.budgetData?.amount ?? 0,
          budgeSelected: u.taskerData.budgetData?.budgeSelected ?? 'no',
          reinsertSelected: u.taskerData.budgetData?.reinsertSelected ?? 'no',
        };

        return {
          idUser: u.idUser,
          fullName: u.fullName,
          userName: u.userName,
          roles: u.rolesData?.map(r => ({
            idRole: r.idRole,
            nameRole: r.nameRole,
          })),

          tasker: {
            idTasker: u.taskerData?.idTasker,
            description: u.taskerData?.description,
            idCategory: u.taskerData?.idCategory,
          },

          budget: sectionBudget ?? null,
          days: u.taskerData?.daysData?.map(d => d.dayName || '') || [],
          hours: u.taskerData?.hoursData?.map(h => h.hourName || '') || [],
          services: u.taskerData?.servicesData?.map(s => s.serviceName || '') || [],
          worksArea: u.taskerData?.workAreasData?.map(w => w.workAreaName || '') || [],
          category: u.taskerData?.categoryData?.categoryName || '',

          profileImageUrl: `api/v1/tasker/profile/${u.taskerData?.idTasker}/image`,
        } as TActiveTaskerUser;
      });
      this.logger.debug(allDataUsers);

      return allDataUsers;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  //LEER DATOS DE UN USUARIO TASKER CONCRETO
  async getTaskerSingle(idTasker: string): Promise<TDataPayloadTaskerSingle | null> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          taskerData: { idTasker: Equal(idTasker) }, //COMPARA ESTRICAMENTE EL VALOR
          active: true,
        },
        relations: [
          'rolesData',
          'locationData',
          'taskerData',
          'taskerData.servicesData',
          'taskerData.workAreasData',
          'taskerData.imageExperience',
          'taskerData.budgetData',
          'taskerData.daysData',
          'taskerData.hoursData',
          'taskerData.categoryData',
        ],
      });

      // SI NO EXISTE UUSUARIO
      if (!user) {
        throw ErrorManager.createSignatureError(
          `NOT_FOUND${ESeparatorsMsgErrors.SEPARATOR}Tasker con ID ${idTasker} no encontrado.`,
        );
      }

      const isTasker: boolean = user.rolesData.some(r => r.nameRole === 'tasker');
      const isRepair: boolean =
        user.taskerData.categoryData.categoryName === 'reparacion-mantenimiento';
      const isWorkAreas: boolean = user.taskerData.workAreasData.length > 0; //SI VIENEN DATOS DE HABITOS

      this.logger.debug(isTasker);

      // DEFINIR ANTES PARA EVITAR PROBLEMAS DE TIPOS EN OBJETO A RETORNAR
      const sectionBudget: TBudgetData = {
        idBudget: user.taskerData.budgetData?.idBudget ?? null,
        amount: user.taskerData.budgetData?.amount ?? 0,
        budgeSelected: user.taskerData.budgetData?.budgeSelected ?? 'no',
        reinsertSelected: user.taskerData.budgetData?.reinsertSelected ?? 'no',
      };

      // RETORNAR
      const dataUser: TDataPayloadTaskerSingle = {
        sub: user.idUser,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        roles: user.rolesData?.map(r => ({
          idRole: r.idRole,
          nameRole: r.nameRole,
        })),
        isWorkAreas,
        isRepair, //SI ES CATEGORIA REPARACIONES
        isTasker, //SI ES TASKER
        taskerId: user.taskerData.idTasker,
        days: isTasker ? user.taskerData?.daysData?.map(d => d.dayName || '') || [] : [],
        hours: isTasker ? user.taskerData?.hoursData?.map(h => h.hourName || '') || [] : [],
        services: isTasker
          ? user.taskerData?.servicesData?.map(s => s.serviceName || '') || []
          : [],
        worksArea: isTasker
          ? user.taskerData?.workAreasData?.map(w => w.workAreaName || '') || []
          : [],
        category: isTasker ? user.taskerData?.categoryData?.categoryName || '' : '',
        budget: sectionBudget ?? null,
        description: isTasker ? user.taskerData?.description || '' : '',
        profileImageUrl: isTasker
          ? `api/v1/tasker/profile/${user.taskerData?.idTasker}/image`
          : null,
        experienceImagesUrl: user.taskerData?.imageExperience
          ? user.taskerData.imageExperience.map(
              img => `api/v1/tasker/experience/${img.idExperience}/image`,
            )
          : [],
        city: user.locationData.cityName,
      };

      this.logger.debug(dataUser);

      return dataUser;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
