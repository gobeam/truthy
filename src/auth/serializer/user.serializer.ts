import { ModelSerializer } from '../../common/serializer/model.serializer';
import { UserStatusEnum } from '../user-status.enum';
import { RoleEntity } from '../../roles/entities/role.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleSerializer } from '../../roles/serializer/role.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['user.timestamps'];

export class UserSerializer extends ModelSerializer {
  username: string;
  email: string;
  name: string;
  @Expose({ groups: ['admin'] })
  status: UserStatusEnum;

  @Expose({ groups: ['owner'] })
  @Type(() => RoleSerializer)
  role: RoleEntity;

  @Exclude({ toClassOnly: true })
  roleId: number;

  @Expose({ groups: ['user.timestamps'] })
  createdAt: Date;

  @Expose({ groups: ['user.timestamps'] })
  updatedAt: Date;
}
