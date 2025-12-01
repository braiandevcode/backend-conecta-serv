import { HttpException, Injectable } from '@nestjs/common';
import { CreateWorkAreaDto } from './dto/create-work-area.dto';
import { UpdateContextDto } from './dto/update-work-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkArea } from './entities/workArea.entity';
import { EntityManager, Repository } from 'typeorm';
import { EntityCreatorService } from 'src/shared/entityCreator.service';
import { ErrorManager } from 'src/config/ErrorMannager';
import { VALID_WORK_AREAS } from 'src/common/enums/enum.utils';

@Injectable()
export class WorkAreaService {
  constructor(
    @InjectRepository(WorkArea)
    private readonly workAreasRepository: Repository<WorkArea>,
    private readonly entityCreatorService: EntityCreatorService,
  ) {}

  create(createContextDto: CreateWorkAreaDto) {
    return 'This action adds a new context';
  }

  // BUSCAR O CREAR
  async findeOrCreate(workArea: string[], manager?: EntityManager): Promise<WorkArea[]> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo:Repository<WorkArea> = manager ? manager.getRepository(WorkArea) : this.workAreasRepository;
      // SERVICIO UTILS QUE YA VALIDA INTERNAMENTE
      return await this.entityCreatorService.findOrCreateEntitiesByNames({
        keyNames: workArea,
        keyName: 'workAreaName',
        repo,
        validValues:VALID_WORK_AREAS
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
    return `This action returns all context`;
  }

  findOne(id: number) {
    return `This action returns a #${id} context`;
  }

  update(id: number, updateContextDto: UpdateContextDto) {
    return `This action updates a #${id} context`;
  }

  remove(id: number) {
    return `This action removes a #${id} context`;
  }
}
