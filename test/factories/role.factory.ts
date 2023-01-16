import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

import { RoleEntity } from 'src/role/entities/role.entity';

export class RoleFactory {
  private connection: DataSource;
  static new(connection: DataSource) {
    return new RoleFactory(connection);
  }

  constructor(connection: DataSource) {
    this.connection = connection;
  }

  create(role: Partial<RoleEntity> = {}) {
    return this.connection.manager.save(RoleEntity, {
      name: faker.name.jobTitle(),
      description: faker.lorem.sentence(),
      ...role
    });
  }

  async createMany(roles: Partial<RoleEntity>[]) {
    return Promise.all([roles.map((role) => this.create(role))]);
  }
}
