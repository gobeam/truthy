import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { RoleEntity } from '../../roles/entities/role.entity';
import { PermissionConfiguration } from '../../config/permission-config';

export default class CreateRoleSeed {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const superuserRole = PermissionConfiguration.superRole;
    await connection
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values([superuserRole])
      .orIgnore()
      .execute();
  }
}
