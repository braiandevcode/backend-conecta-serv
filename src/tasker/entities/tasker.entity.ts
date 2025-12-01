import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Service } from 'src/service/entities/service.entity';
import { WorkArea } from 'src/work-area/entities/workArea.entity';
import { Day } from 'src/day/entities/day.entity';
import { Hour } from 'src/hour/entities/hour.entity';
import { JoinMannager } from 'src/config/JoinMannager.';
import { User } from 'src/user/entities/user.entity';
import { Budget } from 'src/budget/entities/budget.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { Experience } from 'src/experiences/entities/experience.entity';
import { Exclude } from 'class-transformer';

@Entity('taskers')
@Check('"active" IN (0, 1)')
export class Tasker {
  @PrimaryGeneratedColumn('uuid', { name: 'id_tasker' })
  idTasker: string;

  @Column({ name: 'description', type: 'varchar', length: 350, default: '' })
  description: string;

  @Exclude()
  @Column({ name: 'id_category', type: 'uuid', nullable: false })
  idCategory: string;

  //RELACIONES MUCHOS A UNO => MUCHOS TASKERS TENDRAN UNA MISMA CATEGORIA
  @ManyToOne(() => Category, category => category.taskers, { nullable: false })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_category',
        referencedColumnName: 'idCategory',
        fkName: 'fk_tasker_category',
      },
    }),
  ) //==> UNIR COLUMNAS
  categoryData: Category;

  // REALACION  N:M UN TASKER PUEDE TENER UNO O MUCHOS SERVICIOS ELEGIDOS
  @ManyToMany(() => Service, services => services.taskers, { cascade: true })
  @JoinTable(
    JoinMannager.manyToManyConfig({
      //CLASE CONFIGURATIVA PERSONAL
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_tasker_service_tasker', //==> NOMBRE DE LA CLAVE FORANEA HACIA TASKER
      }, //COLUMNA ENTIDAD ACTUAL
      related: {
        name: 'id_service',
        referencedColumnName: 'idService',
        fkName: 'fk_tasker_service_service', // NOMBRE DE LA CLAVE FORANEA HACIA SERVICE
      }, //COLUMNA ENTIDAD RELACIONADA
    }),
  )
  servicesData: Service[];

  // REALACION  N:M UN TASKER PUEDE TENER UNO O MUCHOS HABITOS DE TRABAJO ELEGIDOS
  @ManyToMany(() => WorkArea, works => works.tasker, { cascade: true })
  @JoinTable(
    JoinMannager.manyToManyConfig({
      //CLASE CONFIGURATIVA PERSONAL
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_tasker_work_area_tasker', //==> NOMBRE DE LA CLAVE FORANEA HACIA TASKER
      }, //COLUMNA ENTIDAD ACTUAL
      related: {
        name: 'id_work_area',
        referencedColumnName: 'idWorkArea',
        fkName: 'fk_tasker_work_area_work_area', // NOMBRE DE LA CLAVE FORANEA HACIA HABITOS DE TRABAJO
      }, //COLUMNA ENTIDAD RELACIONADA
    }),
  )
  workAreasData: WorkArea[];

  // REALACION  N:M UN TASKER PUEDE TENER UNO O MUCHOS DIAS ELEGIDOS
  @ManyToMany(() => Day, day => day.taskers)
  @JoinTable(
    JoinMannager.manyToManyConfig({
      //CLASE CONFIGURATIVA PERSONAL
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_tasker_day_tasker', //==> NOMBRE DE LA CLAVE FORANEA HACIA TASKER
      }, //COLUMNA ENTIDAD ACTUAL
      related: {
        name: 'id_day',
        referencedColumnName: 'idDay',
        fkName: 'fk_tasker_day_day', // NOMBRE DE LA CLAVE FORANEA HACIA DIA
      }, //COLUMNA ENTIDAD RELACIONADA
    }),
  )
  daysData: Day[];

  // REALACION  N:M UN TASKER PUEDE TENER UNO O MUCHOS HORARIOS ELEGIDOS
  @ManyToMany(() => Hour, hours => hours.users)
  @JoinTable(
    JoinMannager.manyToManyConfig({
      //CLASE CONFIGURATIVA PERSONAL
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_tasker_hour_tasker', //==> NOMBRE DE LA CLAVE FORANEA HACIA TASKER
      }, //COLUMNA ENTIDAD ACTUAL
      related: {
        name: 'id_hour',
        referencedColumnName: 'idHour',
        fkName: 'fk_tasker_hour_hour', // NOMBRE DE LA CLAVE FORANEA HACIA HORARIOS
      }, //COLUMNA ENTIDAD RELACIONADA
    }),
  )
  hoursData: Hour[];

  // RELACION  1:1 UN TASKER SOLO ESTA ASOCIADO A UN REGISTRO DE DETALLES DE SU PERFIL
  @OneToOne(() => Profile, image => image.tasker)
  imageProfile: Profile;

  @OneToMany(() => Experience, experience => experience.tasker)
  imageExperience: Experience[];

  // RELACION 1:1 UN TASKER SOLO TENDRA CERO O UN REGISTRO DE PRESUPUESTO
  @OneToOne(() => Budget, budget => budget.tasker, { onDelete:'CASCADE', cascade: true, nullable: true })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_budget',
        referencedColumnName: 'idBudget',
        fkName: 'fk_tasker_budget',
      },
    }),
  )
  budgetData: Budget | null;

  //BORRADO LOGICO PARA INTEGRIDAD, AUDITORIA O RECUPERACION
  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  // RELACION 1:1 UN TASKER SOLO PODRA ESTAR ASOCIADO A UN USUARIO
  @OneToOne(() => User, user => user.taskerData)
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
