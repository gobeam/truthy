import { CustomBaseEntity } from '../../common/entity/custom-base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity({ name: 'permission' })
@Unique(['description'])
export class PermissionEntity extends CustomBaseEntity {
  @Column('varchar', { length: 100 })
  resource: string;
  @Column()
  @Index({ unique: true })
  description: string;
  @Column()
  path: string;
  @Column('varchar', { default: 'get', length: 20 })
  method: string;
  @Column()
  isDefault: boolean;

  constructor(data?: Partial<PermissionEntity>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
