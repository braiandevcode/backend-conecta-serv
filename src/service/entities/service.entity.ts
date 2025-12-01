import { EServiceGarden } from 'src/common/enums/enumServiceGarden';
import { EServiceRepair } from 'src/common/enums/enumServiceRepair';
import { EServiceMoving } from 'src/common/enums/enumServicesMoving';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid', { name: 'id_service' }) //genera un id automaticamente USARLO EN LAS DEMAS ENTIDADES
  idService: string;

  @Column({
    name: 'service_name',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  serviceName: EServiceGarden | EServiceRepair | EServiceMoving;

  //RELACION N:N MUCHOS SERVICIOS PUEDEN PERTENECER A MUCHOS USUARIOS
  @ManyToMany(() => Tasker, (tasker) => tasker.servicesData)
  taskers: Tasker[];
}
