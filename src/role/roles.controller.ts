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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { RolesService } from 'src/role/roles.service';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/role/dto/update-role.dto';
import { RoleFilterDto } from 'src/role/dto/role-filter.dto';
import { RoleSerializer } from 'src/role/serializer/role.serializer';
import { Pagination } from 'src/paginate';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';

@ApiTags('roles')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiQuery({
    type: RoleFilterDto
  })
  findAll(
    @Query()
    roleFilterDto: RoleFilterDto
  ): Promise<Pagination<RoleSerializer>> {
    return this.rolesService.findAll(roleFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<RoleSerializer> {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.rolesService.remove(+id);
  }
}
