import { JoinMannager } from 'src/config/JoinMannager.';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid', { name: 'id_budget' })
  idBudget: string;

  @Column({ name: 'option_budge', type: 'varchar', length: 3, default: 'no'})
  budgeSelected: string;

  @Column({
    name: 'option_reinsert',
    type: 'varchar',
    length: 3,
    default:'no'
  })
  reinsertSelected: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10, //TOTAL DE DIGITOS
    scale: 2, //DESPUES DEL DECIMAL
    nullable: true,
  })
  amount: number;

  // RELACION 1:1 UN REGISTRO DE PRESUPUESTO SOLO PERTENECE A UN TASKER
  @OneToOne(() => Tasker, (tasker) => tasker.budgetData)
  tasker:Tasker;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date; //FECHA DE CREACION

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date; //FECHA DE MODIFICACION

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date; // FECHA DE ELIMINACION
}
