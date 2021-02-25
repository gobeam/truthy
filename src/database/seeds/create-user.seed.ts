import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { PermissionConfiguration } from '../../config/permission-config';
import { User } from '../../auth/entity/user.entity';
import { UserStatusEnum } from '../../auth/user-status.enum';
import { RoleEntity } from '../../roles/entities/role.entity';

export default class CreateUserSeed {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const role = await connection
      .getRepository(RoleEntity)
      .createQueryBuilder('role')
      .where('role.name = :name', { name: PermissionConfiguration.superRole.name })
      .getOne();

    if (!role) {
      return;
    }
    // let user = new User();
    // user.username = 'admin';
    // user.email = 'admin@truthy.com';
    // user.password = 'truthy@123';
    // user.name = 'truthy';
    // user.status = UserStatusEnum.ACTIVE;
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: 'admin',
          email: 'admin@truthy.com',
          password:
            '$2b$10$O9BWip02GuE14bDPfBomQebCjwKQyuUfkulhvBB1UoizOeKxGG8Fu', // Truthy@123
          salt: '$2b$10$O9BWip02GuE14bDPfBomQe',
          name: 'truthy',
          status: UserStatusEnum.ACTIVE,
          roleId: role.id
        }
      ])
      .orIgnore()
      .execute();
  }
}
