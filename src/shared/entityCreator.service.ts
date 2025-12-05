import { HttpException, Injectable, Logger} from '@nestjs/common';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';
import { ErrorManager } from 'src/config/ErrorMannager';
import { FindOptionsWhere, In, Repository } from 'typeorm';

@Injectable()
export class EntityCreatorService {
  private readonly logger:Logger = new Logger(EntityCreatorService.name)
  // EL OBJETIVO DE ESTE METODO ES GARANTIZAR QUE, PARA CADA NOMBRE QUE EL USUARIO ELIGE:
  // - LO BUSQUE.
  // - SI EXISTE LO USE.
  // - SI NO EXISTE LO CREA.

  // AL FINAL, DEVOLVER TODOS LOS RESULTADOS PARA QUE LA LOGICA DE NEGOCIO
  // PUEDA UTILIZARLOS PARA CREAR LAS RELACIONES INVERSAS EN LA ENTIDAD "tasker"
  // METODO HELPER GENERICO PARA EVITAR DUPLICAR LOGICA DE CREACION DE ENTIDADES (SERVICE, WORKAREA, ETC)
  public async findOrCreateEntitiesByNames<R extends object>({repo, keyNames, keyName, validValues}: 
  {
    repo: Repository<R>;
    keyNames: string[];
    // keyof R: DEVUELVE UNA UNION DE LAS CLAVES(COLUMNAS DE LA ENTIDAD O REGISTRO) DEL TIPO "R" EJEMPLO ==> "Service"
    //EJEMPLO:
    // type Keys = keyof Service;
    // RESULTADO: "serviceName" | "idService"
    // FUERZA A QUE "keyName" SEA UNA CLAVE VALIDA DEL TIPO R Y ADEMAS SEA UN STRING
    keyName: keyof R & string; 
    validValues: string[]; //ARRAY DE LOS VALORES QUE DEBERIAN SER VALIDOS VALIDOS
  }): Promise<R[]> {
    try {
      // IDENTIFICAR LOS VALORES QUE  NO ESTAN PERMITIDOS EN EL SISTEMA (NO EXISTEN EN EL ENUM)
      const invalidNames:string[] = keyNames.filter((name) => !validValues.includes(name));

      // SI ES MAYOR A CERO NO PERMITIR
      if(invalidNames.length > 0){
         throw ErrorManager.createSignatureError(`FORBIDDEN${ESeparatorsMsgErrors.SEPARATOR}Los valores: ${invalidNames
          .join(', ')} no estan permitidos`,
        );
      }

      // BUSCAR EXISTENTES EN DB SEGUN LOS VALORES EN EL ARRAY
      const existingEntities:R[] = await repo.find({
        //unknown DICE: OLVIDATE POR UN MOMENTO DEL TIPO ORIGINAL, TRATA ESTO COMO ALGO DESCONOCIDO
        //FindOptionsWhere<R>:==> INDICA WHERE DEL TIPO QUE VENGA DEL REPO
        
        //CLAUSULA In():BUSCA FILAS DONDE EL VALOR DE UNA COLUMNA ESPECIFICA COINCIDA CON CUALQUIERA DE LOS VALORES PROPORCIONADOS EN UN ARRAY.
        where: { [keyName]: In(keyNames) } as unknown as FindOptionsWhere<R>, // INDICA WHERE DEL TIPO QUE VENGA DEL REPO
      });

      // MAPEAR LOS NOMBRES EXISTENTES PARA EVITAR DUPLICADOS
      // ENTIDAD  ==> "R" ==> EJEMPLO: "Service"
      //CLAVES NOMBRADAS EN MEMORIA PARA REFERENCIAR DE COLUMNAS EN TYPEORM "Service" ==> "serviceName", "idService", etc..
      //ENTONCES, R[keyof R & string][] EQUIVALE A:
      //==> EJEMPLO Service["serviceName"] EQUIVALE A "serviceName"[]

      // CONCLUSION: CREARÁ UN ARRAY CON LOS VALORES EXISTENTES ACTUALMENTE DEL CAMPO QUE SE LE INDICA MAS TARDE
      const allCurrentExixtNames: R[keyof R & string][] = existingEntities.map(
        (entity) => entity[keyName], //NOMBRE DE REFERENCIA A LA COLUMNA DE LA ENTIDAD
      );
      // AHORA allCurrentExitNames SERIA DEL TIPO EJEMPLO: "serviceName"[] CON LOS VALORES CARGADOS ACTUALMENTE EN EL MAPEO
      this.logger.debug(allCurrentExixtNames);

      // FUNCION QUE RETORNA UN BOOLEAN ==> RETORNA VERDAD SI NO EXISTE EN LA DB SINO FALSE
      const isNotExistingName = (name: string): boolean => !allCurrentExixtNames.includes(name as R[keyof R & string]);

      // FILTRAR SOLO LOS QUE SON TRUE ==> NO EXISTEN AUN
      const filterByName: string[] = keyNames.filter((name) =>
        isNotExistingName(name),
      );

      // CREAR ARRAY CON ESOS NUEVOS VALORES QUE NO EXISTEN
      const newValuesInEntity: R[] =  filterByName.map((name) =>
        //EJEMPLO LOGICA EN CADA VUELTA DEL MAP "serviceName":"Plomeria"
        repo.create({ [keyName]: name } as R),
      );


      // GUARDAR SOLO SI HAY NUEVOS
      // SI HAY NUEVOS
      if (newValuesInEntity.length > 0) {
        await repo.save(newValuesInEntity); //GUARDAR NUEVOS
      }

      // DEVOLVER TODOS (EXISTENTES + NUEVOS)
      return [...existingEntities, ...newValuesInEntity];
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }
}
