import { CreateRoleDto } from './create-role.dto';
import { IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
