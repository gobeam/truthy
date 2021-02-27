import { EntityRepository, Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionFilterDto } from './dto/permission-filter.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(PermissionEntity)
export class PermissionRepository extends Repository<PermissionEntity> {
  async store(
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionEntity> {
    const { resource, description, path, method } = createPermissionDto;
    const permission = this.create();
    permission.resource = resource;
    permission.description = description;
    permission.path = path;
    permission.method = method;
    await permission.save();
    return permission;
  }

  async findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<PermissionEntity[]> {
    const query = this.createQueryBuilder('permission');
    const searchFieldArray = ['resource', 'path', 'method', 'description'];
    for (const field of searchFieldArray) {
      if (permissionFilterDto[field]) {
        query.orWhere(`permission.${field} LIKE :${field}`, {
          [field]: `%${permissionFilterDto[field]}%`
        });
      }
    }
    return query.getMany();
  }

  async updateItem(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionEntity> {
    const result = await this.createQueryBuilder()
      .update(PermissionEntity)
      .set(updatePermissionDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    if (!result.affected) {
      throw new NotFoundException();
    }
    return new PermissionEntity(result.raw[0]);
  }
}
