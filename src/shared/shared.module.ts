import { Module } from '@nestjs/common';
import { EntityCreatorService } from './entityCreator.service';

@Module({
  // DECLARAR EL SERVICIO COMO DISPONIBLE DENTRO DE ESTE MODULO
  providers: [EntityCreatorService],
  //IMPORTAR EL SERVICIO  PARA QUE OTROS MODULOES QUE IMPORTEN "SharedModule" PUEDAN USARLO
  exports: [EntityCreatorService],
})
export class SharedModule {}
