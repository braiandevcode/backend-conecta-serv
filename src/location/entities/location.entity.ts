import { ELocations } from 'src/common/enums/enumLocations';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

//ENTIDAD DE LOCALIDAD ELEGIDA POR EL USUAURIO
@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid', { name: 'id_location' })
  idLocation: string;

  @Column({ name: 'city_name', type: 'varchar', length: 150, nullable: false, unique:true })
  cityName: ELocations;

  //RELACIONES ==> UNA MISMA LOCALIDAD PUEDE PERTENECER A MUCHOS USUARIOS
  @OneToMany(() => User, (user) => user.locationData)
  user: User[]; //==> VARIOS USUARIOS TIENEN UNA MISMA CIUDAD

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAtAt: Date;
}
