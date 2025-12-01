import { Tasker } from 'src/tasker/entities/tasker.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

// ENTIDAD DE HORARIOS ELEGIDOS
@Entity('hours')
export class Hour {
  @PrimaryGeneratedColumn('uuid', { name: 'id_hour' })
  idHour: string;

  @Column({ name: 'hour_name', type: 'varchar', length: 250, nullable: false })
  hourName: string;

  @ManyToMany(() => Tasker, (user) => user.hoursData)
  users: Tasker[];
}
