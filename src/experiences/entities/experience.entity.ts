import { JoinMannager } from 'src/config/JoinMannager.';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// ENTIDAD DE IMAGENES DE EXPERIENCIAS ELEGIDAS
@Entity('image_experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid',{ name: 'id_experience'})
  idExperience: string;
  @Column({ name: 'image_base64', type: 'longblob', nullable: false })
  imageBase64: Buffer;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: false })
  mimeType: string;

  @Column({ name: 'size', type: 'int', unsigned: true, nullable: false })
  size: number;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  originalName: string;

  @Column({
    name: 'order',
    type: 'tinyint',
    unsigned: true,
    nullable: false,
  })
  order: number;

  @Column({
    name:'system_file_name',
    type:'char',
    length:45,
    nullable:false,
  })
  systemFileName:string;

  // RELACION M:1 UNO O MUCHOS REGISTROS DE IMAGENES DE EXPERIENCIAS PERTENECEN A UN  SOLO REGISTRO DE DETALLES DE PERFIL DE TASKER
  @ManyToOne(() => Tasker, (tasker) =>tasker.imageExperience, { cascade:true })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_image_experiences_tasker',
      },
    }),
  ) // FK EN TABLA EXPERIENCIAS
  tasker:Tasker;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
