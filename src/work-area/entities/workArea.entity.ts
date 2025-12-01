import { EWorkAreas } from 'src/common/enums/enumWorkAreas';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

// ENTIDAD DE HABITOS ELEGIDOS
@Entity('work_areas')
export class WorkArea {
  @PrimaryGeneratedColumn('uuid', { name: 'id_work_area' })
  idWorkArea: string;

  @Column({ name: 'work_area_name', type:'varchar', length:250, nullable:false })
  workAreaName: EWorkAreas;

  // RELACION M:N ==> 1 O MAS HABITOS DE TRABAJO PUEDE PERTENECER A MUCHOS TASKERS
  @ManyToMany(() => Tasker, (tasker) => tasker.workAreasData)
  tasker: Tasker[];
}
