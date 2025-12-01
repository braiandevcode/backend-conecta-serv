import { Tasker } from 'src/tasker/entities/tasker.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

// ENTIDAD DE DIAS ELEGIDOS
@Entity('days')
export class Day {
  @PrimaryGeneratedColumn('uuid', { name: 'id_day' })
  idDay: string;

  @Column({ name: 'day_name', type: 'varchar', length: 250, nullable: false })
  dayName: string;

  // RELACION M:N ==> 1 O MAS DIAS DE TRABAJO PUEDE PERTENECER A MUCHOS TASKERS
  @ManyToMany(() => Tasker, (tasker) => tasker.daysData)
  taskers: Tasker[];
}
