import { MigrationInterface, QueryRunner } from 'typeorm';

import { RoleEntity } from 'src/role/entities/role.entity';
import { PermissionConfiguration } from 'src/config/permission-config';
import { PermissionEntity } from 'src/permission/entities/permission.entity';

export class RoleSeed1673336242989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roles = PermissionConfiguration.roles;
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values(roles)
      .orIgnore()
      .execute();

    // Assign all permission to superUser
    const role = await queryRunner.manager
      .getRepository(RoleEntity)
      .createQueryBuilder('role')
      .where('role.name = :name', {
        name: 'superuser'
      })
      .getOne();

    if (role) {
      role.permission = await queryRunner.manager
        .getRepository(PermissionEntity)
        .createQueryBuilder('permission')
        .getMany();
      await queryRunner.manager.save(RoleEntity, role);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(RoleEntity).delete({});
  }
}
