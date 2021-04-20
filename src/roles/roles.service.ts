import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleSerializer } from './serializer/role.serializer';
import { CommonServiceInterface } from '../common/interfaces/common-service.interface';
import { ObjectLiteral } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService implements CommonServiceInterface<RoleSerializer> {
  constructor(
    @InjectRepository(RoleRepository) private repository: RoleRepository,
    private readonly permissionsService: PermissionsService
  ) {}

  async getPermissionByIds(ids) {
    if (ids && ids.length > 0) {
      return await this.permissionsService.whereInIds(ids);
    }
    return [];
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async store(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    return this.repository.store(createRoleDto, permission);
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  async findAll(roleFilterDto: RoleFilterDto): Promise<RoleSerializer[]> {
    return this.repository.getAll(roleFilterDto);
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: number): Promise<RoleSerializer> {
    return this.repository.get(id);
  }

  /**
   * update role by id
   * @param id
   * @param updateRoleDto
   */
  async update(
    id: number,
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    const role = await this.repository.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }
    const condition: ObjectLiteral = {
      name: updateRoleDto.name
    };
    const checkUniqueTitle = await this.repository.countEntityByCondition(
      condition,
      id
    );
    if (checkUniqueTitle > 0) {
      throw new UnprocessableEntityException({ name: 'already taken' });
    }
    const { permissions } = updateRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    return this.repository.updateItem(role, updateRoleDto, permission);
  }

  /**
   * remove role by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    return role.remove();
  }
}
