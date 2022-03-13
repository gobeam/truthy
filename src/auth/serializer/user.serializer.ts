import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { RoleSerializer } from 'src/role/serializer/role.serializer';

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

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  address: string;

  @ApiProperty()
  @Expose({
    groups: ownerUserGroupsForSerializing
  })
  isTwoFAEnabled: boolean;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  contact: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  avatar: string;

  @ApiPropertyOptional()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  status: UserStatusEnum;

  @ApiHideProperty()
  @Expose({
    groups: ownerUserGroupsForSerializing
  })
  @Type(() => RoleSerializer)
  role: RoleSerializer;

  @Exclude({
    toClassOnly: true
  })
  roleId: number;

  @Exclude({
    toClassOnly: true
  })
  tokenValidityDate: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing
  })
  updatedAt: Date;
}
