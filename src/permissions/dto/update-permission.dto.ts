import { CreatePermissionDto } from './create-permission.dto';
import { IsString } from 'class-validator';
import { Optional } from '@nestjs/common';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiPropertyOptional()
  @Optional()
  @IsString()
  description: string;
}
