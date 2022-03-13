import { IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { CreateRoleDto } from 'src/role/dto/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
