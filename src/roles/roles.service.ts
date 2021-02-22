import { Injectable } from '@nestjs/common';
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

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll(roleFilterDto: RoleFilterDto): Promise<RoleEntity[]> {
    return this.repository.findAll(roleFilterDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
