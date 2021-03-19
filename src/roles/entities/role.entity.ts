import { CustomBaseEntity } from '../../common/entity/custom-base.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, Unique } from 'typeorm';
import { PermissionEntity } from '../../permissions/entities/permission.entity';

@Entity({ name: 'role' })
@Unique(['name'])
export class RoleEntity extends CustomBaseEntity {
  @Column('varchar', { length: 100 })
  @Index({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'roleId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id'
    }
  })
  permission: PermissionEntity[];

  constructor(data?: Partial<RoleEntity>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
