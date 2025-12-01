import { HttpException, Injectable } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { Day } from './entities/day.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EntityCreatorService } from 'src/shared/entityCreator.service';
import { ErrorManager } from 'src/config/ErrorMannager';
import { VALID_DAYS } from 'src/common/enums/enum.utils';

@Injectable()
export class DayService {
  constructor(@InjectRepository(Day) private readonly dayRepository: Repository<Day>,private readonly entityCreatorService: EntityCreatorService) {}

  create(createDayDto: CreateDayDto) {
    return 'This action adds a new day';
  }

  // BUSCAR O CREAR
  async findeOrCreate(days: string[], manager?: EntityManager): Promise<Day[]> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo:Repository<Day> = manager ? manager.getRepository(Day) : this.dayRepository;
      
      // SERVICIO UTILS QUE YA VALIDA INTERNAMENTE
      return await this.entityCreatorService.findOrCreateEntitiesByNames({
        keyNames: days,
        keyName: 'dayName',
        repo,
        validValues: VALID_DAYS,
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
    return `This action returns all day`;
  }

  findOne(id: number) {
    return `This action returns a #${id} day`;
  }

  update(id: number, updateDayDto: UpdateDayDto) {
    return `This action updates a #${id} day`;
  }

  remove(id: number) {
    return `This action removes a #${id} day`;
  }
}
