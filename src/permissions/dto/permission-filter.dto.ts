import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

export class PermissionFilterDto extends PartialType(CreatePermissionDto) {}
