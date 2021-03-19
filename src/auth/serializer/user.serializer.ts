import { ModelSerializer } from '../../common/serializer/model.serializer';
import { UserStatusEnum } from '../user-status.enum';
import { RoleEntity } from '../../roles/entities/role.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleSerializer } from '../../roles/serializer/role.serializer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['user.timestamps'];

/**
 * user serializer
 */
export class UserSerializer extends ModelSerializer {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  @Expose({ groups: adminUserGroupsForSerializing })
  status: UserStatusEnum;

  @ApiPropertyOptional()
  @Expose({ groups: ownerUserGroupsForSerializing })
  @Type(() => RoleSerializer)
  role: RoleEntity;

  @Exclude({ toClassOnly: true })
  roleId: number;

  @ApiPropertyOptional()
  @Expose({ groups: defaultUserGroupsForSerializing })
  createdAt: Date;

  @Expose({ groups: defaultUserGroupsForSerializing })
  updatedAt: Date;
}
