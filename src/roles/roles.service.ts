import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { NotFoundException } from '../exception/not-found.exception';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';
import {
  adminUserGroupsForSerializing,
  basicFieldGroupsForSerializing,
  RoleSerializer
} from './serializer/role.serializer';
import { CommonServiceInterface } from '../common/interfaces/common-service.interface';
import { Not, ObjectLiteral } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { Pagination } from '../paginate';

@Injectable()
export class RolesService implements CommonServiceInterface<RoleSerializer> {
  constructor(
    @InjectRepository(RoleRepository) private repository: RoleRepository,
    private readonly permissionsService: PermissionsService
  ) {}

  /**
   * Get Permission Id array
   * @param ids
   */
  async getPermissionByIds(ids) {
    if (ids && ids.length > 0) {
      return await this.permissionsService.whereInIds(ids);
    }
    return [];
  }

  /**
   * Find by name
   * @param name
   */
  async findByName(name) {
    return await this.repository.findOne({ name });
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    return this.repository.store(createRoleDto, permission);
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  async findAll(
    roleFilterDto: RoleFilterDto
  ): Promise<Pagination<RoleSerializer>> {
    return this.repository.paginate(
      roleFilterDto,
      [],
      ['name', 'description'],
      {
        groups: [
          ...adminUserGroupsForSerializing,
          ...basicFieldGroupsForSerializing
        ]
      }
    );
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: number): Promise<RoleSerializer> {
    return this.repository.get(id, ['permission'], {
      groups: [
        ...adminUserGroupsForSerializing,
        ...basicFieldGroupsForSerializing
      ]
    });
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
    condition.id = Not(id);
    const checkUniqueTitle = await this.repository.countEntityByCondition(
      condition
    );
    if (checkUniqueTitle > 0) {
      throw new UnprocessableEntityException({
        property: 'name',
        constraints: {
          unique: 'already taken'
        }
      });
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
    await this.findOne(id);
    await this.repository.delete({ id });
  }
}
