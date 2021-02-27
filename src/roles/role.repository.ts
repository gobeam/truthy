import { EntityRepository, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleFilterDto } from './dto/role-filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';

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
}
