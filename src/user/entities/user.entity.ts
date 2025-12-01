import { Exclude } from 'class-transformer';
import { Code } from 'src/code/entities/code.entity';
import { JoinMannager } from 'src/config/JoinMannager.';
import { Location } from 'src/location/entities/location.entity';
import { RefreshToken } from 'src/refresh-tokens/entities/refresh-token.entity';
import { Role } from 'src/role/entities/role.entity';
import { Tasker } from 'src/tasker/entities/tasker.entity';

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

@Entity('users')
@Check('"active" IN (0, 1)')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id_user' })
  idUser: string;

  @Column({ name: 'fullName', length: 150, nullable: false })
  fullName: string;

  @Column({ name: 'userName', length: 150, unique:true, nullable: false })
  userName: string;

  @Column({
    name: 'email',
    length: 320,
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Exclude() //AL RETORNAR EXCLUYO EL PASSWORD
  @Column({ name: 'password', type: 'text', nullable: false })
  password: string;

  @Column({
    name: 'verified',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isVerified: boolean;

  //BORRADO LOGICO PARA INTEGRIDAD, AUDITORIA O RECUPERACION
  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  //RELACIONES MUCHOS A UNO => MUCHOS USUARIOS TENDRAN UNA LOCALIDAD
  @ManyToOne(() => Location, (location) => location.user, { nullable:false })
  @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_location',
        referencedColumnName: 'idLocation',
        fkName: 'fk_user_location',
      },
    }),
  ) //==> UNION DE TABLAS
  locationData: Location;

  // MUCHOS USUARIOS TENDRAN UNO O MAS ROLES
  @ManyToMany(() => Role, (role) => role.users, { nullable: false })
  // ==> UNIR EN ESTA ENTIDAD YA QUE ES DUEÑA (CONTIENE LA RELACION DE ROLES)
  @JoinTable(
    JoinMannager.manyToManyConfig({
      name: 'user_roles', // NOMBRAMIENTO DE LA TABLA INTERMEDIA
      current: {
        name: 'id_user',
        referencedColumnName: 'idUser',
        fkName: 'fk_user_role_user',
      }, // COLUMNA DE USER
      related: {
        name: 'id_role',
        referencedColumnName: 'idRole',
        fkName: 'fk_user_role_role',
      }, // COLUMNA DE ROLE
    }),
  )
  rolesData: Role[];

  // RELACION 1:1 UN USUARIO SOLO PODRA SER UN UNICO TASKER
  @OneToOne(() => Tasker, (tasker) => tasker.user, { onDelete:'CASCADE', cascade:true, nullable:true })
   @JoinColumn(
    JoinMannager.manyToOneConfig({
      current: {
        name: 'id_tasker',
        referencedColumnName: 'idTasker',
        fkName: 'fk_user_tasker',
      },
    }),
  )
  taskerData: Tasker;

  // RELACION 1:N ==>UN USUARIO PUEDE TENER UNO O VARIOS REFRESH TOKENS
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[]; // RELACION CON UNO O MUCHO REFRESH TOKENS

  // FECHA DE CREACION
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // FECHA DE ACTUALIZACION
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // FECHA DE ELIMINACION O NULL
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
