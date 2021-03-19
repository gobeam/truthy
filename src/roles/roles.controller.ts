import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleEntity } from './entities/role.entity';
import { RoleSerializer } from './serializer/role.serializer';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  store(@Body() createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    return this.rolesService.store(createRoleDto);
  }

  @Get()
  index(@Query() roleFilterDto: RoleFilterDto): Promise<RoleSerializer[]> {
    return this.rolesService.findAll(roleFilterDto);
  }

  @Get(':id')
  show(@Param('id') id: string): Promise<RoleSerializer> {
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
  destroy(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(+id);
  }
}
