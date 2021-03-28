import { EntityRepository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleSerializer } from './serializer/role.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
import { BaseRepository } from '../common/repository/base.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity, RoleSerializer> {
  async store(
    createRoleDto: CreateRoleDto,
    permissions: PermissionEntity[]
  ): Promise<RoleSerializer> {
    const { name, description } = createRoleDto;
    const role = this.create();
    role.name = name;
    role.description = description;
    role.permission = permissions;
    await role.save();
    return this.transform(role);
  }

  async updateItem(
    id: number,
    updatePermissionDto: UpdateRoleDto,
    permission: PermissionEntity[]
  ): Promise<RoleSerializer> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }
    const fields = ['name', 'description'];
    for (const field of fields) {
      if (updatePermissionDto[field]) {
        role[field] = updatePermissionDto[field];
      }
    }
    if (permission && permission.length > 0) {
      role.permission = permission;
    }
    await role.save();
    return this.transform(role);
  }
  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: RoleEntity, transformOption = {}): RoleSerializer {
    return plainToClass(
      RoleSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform array of roles
   * @param models
   */
  transformMany(models: RoleEntity[]): RoleSerializer[] {
    return models.map((model) => this.transform(model));
  }
}
