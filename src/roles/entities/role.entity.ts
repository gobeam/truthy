import { CustomBaseEntity } from '../../custom-base.entity';
import { Column, Entity, JoinColumn, OneToMany, Unique } from 'typeorm';
import { PermissionRoleEntity } from '../../permissions/entities/permission-role.entity';

@Entity({ name: 'role' })
@Unique(['name'])
export class RoleEntity extends CustomBaseEntity {
  @Column('varchar', { length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 100, default: 'Custom' })
  group: string;

  @Column('boolean', { default: false })
  isDefault: boolean;

  @OneToMany(
    (type) => PermissionRoleEntity,
    (permissionRole) => permissionRole.role
  )
  @JoinColumn()
  permissionRoles: PermissionRoleEntity[];
}
