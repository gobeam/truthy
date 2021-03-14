import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsString, ValidateIf } from 'class-validator';

export class RoleFilterDto extends PartialType(CreateRoleDto) {
  @ValidateIf((object, value) => value)
  @IsString()
  name: string;
}
