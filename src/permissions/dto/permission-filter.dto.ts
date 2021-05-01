import { CreatePermissionDto } from './create-permission.dto';
import { IsString, Min, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PermissionFilterDto extends PartialType(CreatePermissionDto) {
  @ApiPropertyOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @Transform(({ value }) => Number.parseInt(value), { toClassOnly: true })
  @Min(1)
  limit: number;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @Transform(({ value }) => Number.parseInt(value), { toClassOnly: true })
  @Min(1)
  page: number;
}
