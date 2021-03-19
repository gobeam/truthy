import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('roles')
@UseGuards(AuthGuard())
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  store(@Body() createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    return this.rolesService.store(createRoleDto);
  }

  @Get()
  @ApiQuery({ type: RoleFilterDto })
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
