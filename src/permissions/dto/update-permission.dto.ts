import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @Optional()
  @IsString()
  description: string;
}
