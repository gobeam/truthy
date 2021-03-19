import { CreateRoleDto } from './create-role.dto';
import { IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class RoleFilterDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  name: string;
}
