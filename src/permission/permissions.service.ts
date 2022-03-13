import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Not, ObjectLiteral } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/permission/dto/update-permission.dto';
import { PermissionRepository } from 'src/permission/permission.repository';
import { PermissionFilterDto } from 'src/permission/dto/permission-filter.dto';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { Permission } from 'src/permission/serializer/permission.serializer';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { basicFieldGroupsForSerializing } from 'src/role/serializer/role.serializer';
import { Pagination } from 'src/paginate';
import {
  PermissionConfiguration,
  RoutePayloadInterface
} from 'src/config/permission-config';
import { LoadPermissionMisc } from 'src/permission/misc/load-permission.misc';

@Injectable()
export class PermissionsService
  extends LoadPermissionMisc
  implements CommonServiceInterface<Permission>
{
  constructor(
    @InjectRepository(PermissionRepository)
    private repository: PermissionRepository
  ) {
    super();
  }

  /**
   * Create new Permission
   * @param createPermissionDto
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.repository.createEntity(createPermissionDto);
  }

  /**
   * Sync Permission with config
   */
  async syncPermission() {
    const modules = PermissionConfiguration.modules;
    let permissionsList: RoutePayloadInterface[] = [];

    for (const moduleData of modules) {
      let resource = moduleData.resource;
      permissionsList = this.assignResourceAndConcatPermission(
        moduleData,
        permissionsList,
        resource
      );

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          permissionsList = this.assignResourceAndConcatPermission(
            submodule,
            permissionsList,
            resource
          );
        }
      }
    }
    return this.repository.syncPermission(permissionsList);
  }

  /**
   * Get all paginated Permission
   * @param permissionFilterDto
   */
  async findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<Pagination<Permission>> {
    return this.repository.paginate(
      permissionFilterDto,
      [],
      ['resource', 'description', 'path', 'method'],
      {
        groups: [...basicFieldGroupsForSerializing]
      }
    );
  }

  /**
   * Get Permission by id
   * @param id
   */
  async findOne(id: number): Promise<Permission> {
    return this.repository.get(id, [], {
      groups: [...basicFieldGroupsForSerializing]
    });
  }

  /**
   * Update permission by id
   * @param id
   * @param updatePermissionDto
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    const permission = await this.repository.get(id);
    const condition: ObjectLiteral = {
      description: updatePermissionDto.description
    };
    condition.id = Not(id);
    const countSameDescription = await this.repository.countEntityByCondition(
      condition
    );
    if (countSameDescription > 0) {
      throw new UnprocessableEntityException({
        property: 'name',
        constraints: {
          unique: 'already taken'
        }
      });
    }
    return this.repository.updateEntity(permission, updatePermissionDto);
  }

  /**
   * Remove permission by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete({ id });
  }

  /**
   * Get Permission array by provided array of id
   * @param ids
   */
  async whereInIds(ids: number[]): Promise<PermissionEntity[]> {
    return this.repository
      .createQueryBuilder('permission')
      .whereInIds(ids)
      .getMany();
  }
}
