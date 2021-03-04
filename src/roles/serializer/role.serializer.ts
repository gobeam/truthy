import { Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { ModelSerializer } from '../../common/serializer/model.serializer';

export const adminUserGroupsForSerializing: string[] = ['user.admin'];

export class RoleSerializer extends ModelSerializer {
  @Column('varchar', { length: 100 })
  name: string;

  @Expose({ groups: ['user.admin'] })
  description: string;
}
