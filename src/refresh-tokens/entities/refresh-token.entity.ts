import { JoinMannager } from 'src/config/JoinMannager.';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid', { name: 'id_refresh' })
  idRefresh: string; // ID UNICO DEL REFRESH TOKEN

  @Column({ type: 'varchar', length: 512, unique:true, nullable:false })
  token: string; // EL STRING DEL REFRESH TOKEN UNICO

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn(JoinMannager.manyToOneConfig({
    current:{
      name:'id_user',
      referencedColumnName:'idUser',
      fkName: 'fk_refresh_tokens_user'
    }
  }))
  user: User; // RELACION CON EL USUARIO

  @Column({ type: 'timestamp', name:'expires_at' })
  expiresAt: Date; // FECHA DE EXPIRACION

  @Column({ name:'ip' ,type: 'varchar', length: 45, nullable: true })
  ip?: string; // IP DEL DISPOSITIVO (OPCIONAL)

  @Column({ name:'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent?: string; // USER AGENT DEL NAVEGADOR / DISPOSITIVO (OPCIONAL)

  @CreateDateColumn({ type:'timestamp', name:'created_at'})
  createdAt: Date; // FECHA DE CREACIÓN

  @UpdateDateColumn({ type:'timestamp', name: 'updated_at'})
  updatedAt: Date; // FECHA DE ACTUALIZACIÓN
}
