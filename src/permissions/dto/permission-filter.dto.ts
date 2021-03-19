import { CreatePermissionDto } from './create-permission.dto';
import { IsString } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class PermissionFilterDto extends PartialType(CreatePermissionDto) {
  @ApiPropertyOptional()
  @IsString()
  description: string;
}
