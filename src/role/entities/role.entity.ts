import { ERoles } from "src/common/enums/enumRoles";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Roles')
export class Role {
    @PrimaryGeneratedColumn('uuid',{ name: 'id_role'})
    idRole: string;

    @Column({ name: 'name_role', type:'varchar', length:50, nullable:false })
    nameRole:ERoles;

    // UNO O MAS ROLES PUEDEN PERTENECER A UNO O MAS USUARIOS
    @ManyToMany(() => User, (user) => user.rolesData)
    users:User[]
}
