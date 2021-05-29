import { Expose, Type } from 'class-transformer';
import { ModelSerializer } from '../../common/serializer/model.serializer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from '../../permissions/serializer/permission.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const basicFieldGroupsForSerializing: string[] = ['basic'];

export class RoleSerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  @Expose({ groups: basicFieldGroupsForSerializing })
  description: string;

  @Type(() => Permission)
  permission: Permission[];

  @ApiPropertyOptional()
  @Expose({ groups: basicFieldGroupsForSerializing })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({ groups: basicFieldGroupsForSerializing })
  updatedAt: Date;
}
