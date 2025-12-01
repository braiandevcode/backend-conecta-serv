import { HttpException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { EntityCreatorService } from 'src/shared/entityCreator.service';
import { EntityManager, Repository } from 'typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { ECategory } from 'src/common/enums/enumCategory';
import { SERVICES_BY_CATEGORY } from 'src/common/enums/enum.utils';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private readonly serviceRepository: Repository<Service>,
    private readonly entityCreatorService: EntityCreatorService,
  ) {}

  create(createServiceDto: CreateServiceDto) {
    return 'This action adds a new service';
  }

  // BUSCAR O CREAR
  async findeOrCreate(category:ECategory, services: string[], manager?:EntityManager): Promise<Service[]> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo:Repository<Service> = manager ? manager.getRepository(Service) : this.serviceRepository;

      // // SI LA CATEGORIA NO ES VALIDA
      if (!(category in SERVICES_BY_CATEGORY)) {
        // ERROR NO ES VALIDA
        throw ErrorManager.createSignatureError(`FORBIDDEN${ESeparatorsMsgErrors.SEPARATOR}La categoría no es válida`);
      }

      // SERVICIO UTILS QUE YA VALIDA INTERNAMENTE
      return await this.entityCreatorService.findOrCreateEntitiesByNames({
        keyNames: services,
        keyName: 'serviceName',
        repo,
        validValues: SERVICES_BY_CATEGORY[category],
      });
      
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  findAll() {
    return `This action returns all services`;
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
