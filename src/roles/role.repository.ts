import { EntityRepository, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleFilterDto } from './dto/role-filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdatePermissionDto } from '../permissions/dto/update-permission.dto';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';

@EntityRepository(RoleEntity)
export class RoleRepository extends Repository<RoleEntity> {
  async findAll(roleFilterDto: RoleFilterDto): Promise<RoleEntity[]> {
    const { name } = roleFilterDto;
    const query = this.createQueryBuilder('role');
    if (name) {
      query.where('role.name LIKE :name', { name: `%${name}%` });
    }
    return query.getMany();
  }

  async store(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { name, description } = createRoleDto;
    const role = this.create();
    role.name = name;
    role.description = description;
    await role.save();
    return role;
  }

  async updateItem(
    id: number,
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleEntity> {
    const result = await this.createQueryBuilder()
      .update(RoleEntity)
      .set(updateRoleDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    if (!result.affected) {
      throw new NotFoundException();
    }
    return new RoleEntity(result.raw[0]);
  }
}
