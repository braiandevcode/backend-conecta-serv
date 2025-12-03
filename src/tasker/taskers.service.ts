import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateTaskerDto } from './dto/create-tasker.dto';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Tasker } from './entities/tasker.entity';
import { Category } from 'src/category/entities/category.entity';
import { ErrorManager } from 'src/config/ErrorMannager';
import { WorkArea } from 'src/work-area/entities/workArea.entity';
import { Service } from 'src/service/entities/service.entity';
import { Day } from 'src/day/entities/day.entity';
import { Hour } from 'src/hour/entities/hour.entity';
import { Budget } from 'src/budget/entities/budget.entity';
import { CategoryService } from 'src/category/category.service';
import { WorkAreaService } from 'src/work-area/workArea.service';
import { HourService } from 'src/hour/hour.service';
import { DayService } from 'src/day/day.service';
import { ServicesService } from 'src/service/services.service';
import { BudgetService } from 'src/budget/budget.service';
import { ProfileService } from 'src/profile/profile.service';
import { ExperiencesService } from 'src/experiences/experiences.service';
import { Profile } from 'src/profile/entities/profile.entity';
import { Experience } from 'src/experiences/entities/experience.entity';
import { instanceToPlain } from 'class-transformer';
import { TaskerResponse } from './dto/response-tasker.dto';
import { ECategory } from 'src/common/enums/enumCategory';
import { TTaskerImage } from 'src/types/typeTaskerImage';

@Injectable()
export class TaskersService {
  private readonly logger: Logger = new Logger(TaskersService.name);
  constructor(
    @InjectRepository(Tasker) private readonly taskerRepo: Repository<Tasker>,
    private readonly categoryService: CategoryService,
    private readonly workAreaService: WorkAreaService,
    private readonly hourService: HourService,
    private readonly dayService: DayService,
    private readonly serviceService: ServicesService,
    private readonly budgetService: BudgetService,
    private readonly imageProfileService: ProfileService,
    private readonly imageExpService: ExperiencesService,
  ) {}

  // CREAR UN TASKER
  async create(
    fileProfile: Express.Multer.File | null,
    filesExp: Express.Multer.File[],
    createTaskerDto: CreateTaskerDto,
    mannager: EntityManager, //ADMINISTRADOR DE TRANSACCION DE typeorm
  ): Promise<Tasker> {
    const { categoryData, dayData, hourData, workAreaData, serviceData, description, budgetData } =
      createTaskerDto;
    try {
      // OBTENER EL ROPISITORIO TRANSACCIONAL ==> NECESARIO PARA EL CREATE
      const taskerRepository: Repository<Tasker> = mannager.getRepository(Tasker);

      this.logger.debug(taskerRepository);
      const categoryEntity: Category = await this.categoryService.findOrCreate(
        categoryData,
        mannager,
      );

      this.logger.debug(categoryEntity);

      //------------------------------HABITOS------------------------------//
      const workAreaEntity: WorkArea[] = await this.workAreaService.findeOrCreate(
        workAreaData.workArea,
        mannager,
      );

      this.logger.debug(workAreaData);

      //------------------------------SERVICIOS------------------------------//
      const serviceEntity: Service[] = await this.serviceService.findeOrCreate(
        categoryData.category as ECategory,
        serviceData.service,
        mannager,
      );

      this.logger.debug(serviceEntity);

      //------------------------------DIAS------------------------------//
      const dayEntity: Day[] = await this.dayService.findeOrCreate(dayData.day, mannager);

      this.logger.debug(dayEntity);
      //------------------------------HORARIOS------------------------------//
      const hourEntity: Hour[] = await this.hourService.findeOrCreate(hourData.hour, mannager);

      this.logger.debug(hourEntity);
      // -------------SECCION DE DATOS PRESUPUESTO-------------------//
      let budgetEntity: Budget | null = null;
      // PREGUNTO SI VIENEN DATOS EN DTO ANTES DE PROCESAR A AGREGAR EN PRESUPUESTO
      if (budgetData) {
        budgetEntity = await this.budgetService.create(
          budgetData,
          categoryEntity.categoryName,
          mannager,
        );
      }

      this.logger.debug(budgetEntity);

      // OBJETO DE DATOS QUE SE AGREGAN AL TASKER
      const newDataTasker: Tasker = taskerRepository.create({
        ...createTaskerDto,
        description,
        categoryData: categoryEntity,
        workAreasData: workAreaEntity,
        servicesData: serviceEntity,
        daysData: dayEntity,
        budgetData: budgetEntity,
        hoursData: hourEntity,
        idCategory: categoryEntity.idCategory,
      });

      this.logger.debug(newDataTasker);

      // ALMACENAR DATOS
      const savedDataTasker: Tasker = await taskerRepository.save(newDataTasker);

      // LLAMO A SERVICIO DE CREACION Y ALMACENAMIENTO DE IMAGEN DEL PERFIL
      const imageProfile: Profile | null =
        (await this.imageProfileService.create(fileProfile, savedDataTasker.idTasker, mannager)) ??
        null;

        this.logger.debug(imageProfile);

      // LLAMO A SERVICIO DE CREACION Y ALMACENAMIENTO DE IMAGENES DEL EXPERIENCIAS
      const imagesExperiences: Experience[] =(await this.imageExpService.create(filesExp, savedDataTasker.idTasker, mannager)) ?? [];

      this.logger.debug(imagesExperiences);

      const taskerPlain = instanceToPlain(savedDataTasker) as Tasker;

      this.logger.debug(taskerPlain);
      return {
        ...taskerPlain,
        profileImage: this.imageProfileService.mapProfileImage(imageProfile),
        experiencesImages: this.imageExpService.mapExperienceImages(imagesExperiences),
      } as TaskerResponse;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENÉRICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LEER IMAGEN DE TASKER
  async getProfileImage(idTasker: string): Promise<TTaskerImage | null> {
    return this.imageProfileService.getProfileByTasker(idTasker);
  }

  // DELEGO METODO DE SERVICIO IMAGENES EXPERIENCIAS
  async getSingleExperienceImage(idExperience: string): Promise<TTaskerImage | null> {
    return await this.imageExpService.getExperienceImageById(idExperience);
  }

  findOne(id: number) {
    return `This action returns a #${id} tasker`;
  }

  update(id: number, updateTaskerDto: UpdateTaskerDto) {
    return `This action updates a #${id} tasker`;
  }

  remove(id: number) {
    return `This action removes a #${id} tasker`;
  }
}
