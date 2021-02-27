import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleRepository) private repository: RoleRepository
  ) {}

  create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    return this.repository.store(createRoleDto);
  }

  findAll(roleFilterDto: RoleFilterDto): Promise<RoleEntity[]> {
    return this.repository.findAll(roleFilterDto);
  }

  async findOne(id: number): Promise<RoleEntity> {
    const role = await this.repository.findOne({
      where: { id }
    });
    if (!role) {
      throw new NotFoundException();
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const { name, description } = updateRoleDto;
    const role = await this.findOne(id);
    role.name = name;
    role.description = description;
    await role.save();
    return role;
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await role.remove();
  }
}
