import { getRepository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { RoleEntity } from 'src/role/entities/role.entity';

export class RoleFactory {
  static new() {
    return new RoleFactory();
  }

  async create(role: Partial<RoleEntity> = {}) {
    const roleRepository = getRepository(RoleEntity);
    return roleRepository.save({
      name: faker.name.jobTitle(),
      description: faker.lorem.sentence(),
      ...role
    });
  }

  async createMany(roles: Partial<RoleEntity>[]) {
    return Promise.all([roles.map((role) => this.create(role))]);
  }
}
