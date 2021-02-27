import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete, Query
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionFilterDto } from './dto/permission-filter.dto';
import { UpdateResult } from 'typeorm';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto
  ): Promise<PermissionEntity> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll(
    @Query() permissionFilterDto: PermissionFilterDto
  ): Promise<PermissionEntity[]> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PermissionEntity> {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionEntity> {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(+id);
  }
}
