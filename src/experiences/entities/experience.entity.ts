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
  @PrimaryGeneratedColumn('uuid', { name: 'id_experience' })
  idExperience: string;

  @Column({ name: 'public_id', type: 'varchar', length: 255, nullable: false, unique: true })
  publicId: string;

  @Column({ name: 'url', type: 'varchar', length: 255, nullable: false })
  url: string;

  @Column({ name: 'secure_url', type: 'varchar', length: 255, nullable: false })
  secureUrl: string;

  @Column({ name: 'signature', type: 'varchar', length: 255, nullable: false })
  signature: string;

  @Column({ name: 'format', type: 'varchar', length: 80, nullable: false })
  format: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 30, nullable: false })
  resourceType: string;

  @Column({ name: 'display_name', type: 'varchar', length: 150, nullable: false })
  displayName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: false })
  type: string;

  @Column({ name: 'bytes', type: 'int', unsigned: true, nullable: false })
  bytes: number;

  @Column({
    name: 'order',
    type: 'tinyint',
    unsigned: true,
    nullable: false,
  })
  order: number;

  // RELACION M:1 UNO O MUCHOS REGISTROS DE IMAGENES DE EXPERIENCIAS PERTENECEN A UN  SOLO REGISTRO DE DETALLES DE PERFIL DE TASKER
  @ManyToOne(() => Tasker, tasker => tasker.imageExperience, { cascade: true })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_image_experiences_tasker',
      },
    }),
  ) // FK EN TABLA EXPERIENCIAS
  tasker: Tasker;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
