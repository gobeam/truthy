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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleSerializer } from './serializer/role.serializer';
import { Pagination } from '../paginate';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../common/guard/permission.guard';

@ApiTags('roles')
@UseGuards(AuthGuard(), PermissionGuard)
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiQuery({ type: RoleFilterDto })
  findAll(
    @Query() roleFilterDto: RoleFilterDto
  ): Promise<Pagination<RoleSerializer>> {
    return this.rolesService.findAll(roleFilterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RoleSerializer> {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(+id);
  }
}
