import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { ErrorManager } from 'src/config/ErrorMannager';
import { ELocations } from 'src/common/enums/enumLocations';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';

@Injectable()
export class LocationsService {
  private readonly logger:Logger = new Logger(LocationsService.name);
  constructor(@InjectRepository(Location) private readonly locationRepository: Repository<Location>) {}

  //BUSCAR O CREAR
  async findOrCreate(createLocationDto:CreateLocationDto, manager?:EntityManager): Promise<Location> {
    const repo: Repository<Location> = manager ? manager.getRepository(Location) : this.locationRepository;
    try {
      let locationEntity = await repo.findOne({
        //EL NOMBRE DE CIUDAD QUE OBTENGA Y SE LE PASE
        where: { cityName: createLocationDto.cityName }, 
      });

      // SI NO EXISTE LA CIUDAD CREARLA
      if (!locationEntity) {
        // EL METODO 'CREATE' SOLO CONSTRUYE UNA INSTANCIA DE LA ENTIDAD EN MEMORIA, APLICANDO DEFAULTS Y PREPARANDO VALIDACIONES, SIN INTERACTUAR CON LA BASE DE DATOS.
        locationEntity = repo.create(createLocationDto);

        this.logger.debug('LOCATION: ', locationEntity)
  
        // VALIDAR QUE LA CIUDAD SEA UNA PERMITIDA
        if (!Object.values(ELocations).includes(locationEntity.cityName)) {
          this.logger.debug('LOCATION ES EL CULPABLE??')
          throw ErrorManager.createSignatureError(`FORBIDDEN${ESeparatorsMsgErrors.SEPARATOR}La ciudad no es una ubicación permitida.`);
        }
        
        // EL METODO 'SAVE' EJECUTA EL COMANDO SQL 'INSERT' EN LA BASE DE DATOS Y DEVUELVE LA ENTIDAD CON SU NUEVO ID.
        locationEntity = await repo.save({...locationEntity });
      }
      return locationEntity;
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
    return `This action returns all locations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
