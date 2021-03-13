import { Expose } from 'class-transformer';
import { ModelSerializer } from '../../common/serializer/model.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];

export class RoleSerializer extends ModelSerializer {
  name: string;

  @Expose({ groups: ['admin'] })
  description: string;
}
