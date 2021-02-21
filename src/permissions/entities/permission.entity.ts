import { CustomBaseEntity } from '../../custom-base.entity';
import { Column, Entity, JoinColumn, OneToMany, Unique } from 'typeorm';
import { PermissionRoleEntity } from './permission-role.entity';

@Entity({ name: 'permission' })
@Unique(['key'])
export class PermissionEntity extends CustomBaseEntity {
  @Column('varchar', { length: 200 })
  key: string;

  @Column()
  description: string;

  @Column('varchar', { default: 'Custom', length: 100 })
  group: string;

  @OneToMany(
    (type) => PermissionRoleEntity,
    (permissionRole) => permissionRole.permission
  )
  @JoinColumn()
  permissionRoles: PermissionRoleEntity[];
}
