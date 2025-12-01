import { JoinMannager } from 'src/config/JoinMannager.';
import { Tasker } from 'src/tasker/entities/tasker.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('image_profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid', { name: 'id_profile' })
  idProfile: string;

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
    name: 'system_file_name',
    type: 'char',
    length: 45,
    nullable: false,
  })
  systemFileName: string;

  // RELACION 1:1 UNA IMAGEN DE PERFIL PUEDE PERTENECER O NO A UN SOLO REGISTRO DE DETALLES DE TASKER
  @OneToOne(() => Tasker, (tasker) => tasker.imageProfile, { cascade: true })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_profile_tasker',
      },
    }),
  ) //FK DE CLAVE DE DETALLES DE PERFIL DE UN TASKER EN TABLA PERFIL
  tasker: Tasker;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
