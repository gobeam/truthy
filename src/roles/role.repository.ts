import { EntityRepository, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleFilterDto } from './dto/role-filter.dto';

@EntityRepository(RoleEntity)
export class RoleRepository extends Repository<RoleEntity> {
  async findAll(roleFilterDto: RoleFilterDto): Promise<RoleEntity[]> {
    const { name, excludeSystem } = roleFilterDto;
    const query = this.createQueryBuilder('role');
    query.where('role.isSystem = :isSystem', { isSystem: !excludeSystem });
    if (name) {
      query.andWhere('role.name LIKE :name', { name: `%${name}%` });
    }
    return query.getMany();
  }
}
