import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleSerializer } from './serializer/role.serializer';
import { CommonServiceInterface } from '../common/interfaces/common-service.interface';
import { CommonService } from '../common/services/common.service';
import { ObjectLiteral } from 'typeorm';

@Injectable()
export class RolesService
  extends CommonService
  implements CommonServiceInterface<RoleSerializer> {
  constructor(
    @InjectRepository(RoleRepository) private repository: RoleRepository
  ) {
    super();
  }

  /**
   * create new role
   * @param createRoleDto
   */
  store(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    return this.repository.createEntity(createRoleDto);
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  findAll(roleFilterDto: RoleFilterDto): Promise<RoleSerializer[]> {
    return this.repository.getAll(roleFilterDto);
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: number): Promise<RoleSerializer> {
    return this.repository.get(id);
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
    const condition: ObjectLiteral = {
      name: updateRoleDto.name
    };
    const checkUniqueTitle = await this.repository.countEntityByCondition(
      condition,
      id
    );
    if (checkUniqueTitle > 0) {
      throw new PreconditionFailedException({ name: 'name already exists' });
    }
    const user = await this.repository.get(id);
    return this.repository.updateEntity(user, updateRoleDto);
  }

  /**
   * remove role by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    return role.remove();
  }

  findBy(fieldName: string, value: any) {
    return this.findBy(fieldName, value);
  }
}
