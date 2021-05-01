import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { PermissionFilterDto } from './dto/permission-filter.dto';
import { CommonServiceInterface } from '../common/interfaces/common-service.interface';
import { Permission } from './serializer/permission.serializer';
import { ObjectLiteral } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { basicFieldGroupsForSerializing } from '../roles/serializer/role.serializer';
import { Pagination } from '../paginate';

@Injectable()
export class PermissionsService implements CommonServiceInterface<Permission> {
  constructor(
    @InjectRepository(PermissionRepository)
    private repository: PermissionRepository
  ) {}

  async store(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.repository.createEntity(createPermissionDto);
  }

  async findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<Pagination<Permission>> {
    return this.repository.paginate(permissionFilterDto, permissionFilterDto, {
      groups: [...basicFieldGroupsForSerializing]
    });
  }

  async findOne(id: number): Promise<Permission> {
    return this.repository.get(id);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    const condition: ObjectLiteral = {
      description: updatePermissionDto.description
    };
    const countSameDescription = await this.repository.countEntityByCondition(
      condition,
      id
    );
    if (countSameDescription > 0) {
      throw new UnprocessableEntityException({
        name: 'already taken'
      });
    }
    const permission = await this.repository.get(id);
    return this.repository.updateEntity(permission, updatePermissionDto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete({ id });
  }

  async whereInIds(ids: number[]): Promise<PermissionEntity[]> {
    return this.repository
      .createQueryBuilder('permission')
      .whereInIds(ids)
      .getMany();
  }
}
