import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('codes_verify_email')
export class Code {
  @PrimaryGeneratedColumn('uuid', { name: 'id_code' })
  idCode: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: '6',
    nullable: false,
  })
  code: string;
  
  @Column({ name: 'expires_at', type: 'timestamp', nullable:false })
  expiresAt: Date;
  
  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  status: string;
  
  // EMAIL UNICO
  @Column({
    name: 'to_email',
    type: 'varchar',
    length:255,
    nullable: false,
    unique: true,
  })
  toEmail: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
