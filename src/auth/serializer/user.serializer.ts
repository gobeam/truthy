import { ModelSerializer } from '../../common/serializer/model.serializer';
import { UserStatusEnum } from '../user-status.enum';
import { RoleEntity } from '../../roles/entities/role.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleSerializer } from '../../roles/serializer/role.serializer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['timestamps'];

/**
 * user serializer
 */
export class UserSerializer extends ModelSerializer {
  @Expose({
    groups: [...ownerUserGroupsForSerializing, ...adminUserGroupsForSerializing]
  })
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  @Expose({ groups: adminUserGroupsForSerializing })
  status: UserStatusEnum;

  @ApiHideProperty()
  @Expose({ groups: ownerUserGroupsForSerializing })
  @Type(() => RoleSerializer)
  role: RoleSerializer;

  @Exclude({ toClassOnly: true })
  roleId: number;

  @Exclude({ toClassOnly: true })
  tokenValidityDate: Date;

  @ApiPropertyOptional()
  @Expose({ groups: defaultUserGroupsForSerializing })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({ groups: defaultUserGroupsForSerializing })
  updatedAt: Date;
}
