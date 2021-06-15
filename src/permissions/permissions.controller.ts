import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionFilterDto } from './dto/permission-filter.dto';
import { Permission } from './serializer/permission.serializer';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../common/guard/permission.guard';
import { Pagination } from '../paginate';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';

@ApiTags('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiQuery({ type: PermissionFilterDto })
  findAll(
    @Query() permissionFilterDto: PermissionFilterDto
  ): Promise<Pagination<Permission>> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(+id);
  }

  @Post('/sync')
  @HttpCode(HttpStatus.NO_CONTENT)
  syncPermission(): Promise<void> {
    return this.permissionsService.syncPermission();
  }
}
