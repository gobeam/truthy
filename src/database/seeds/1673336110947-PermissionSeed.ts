import { MigrationInterface, QueryRunner } from 'typeorm';

import {
  ModulesPayloadInterface,
  PermissionConfiguration,
  PermissionPayload,
  RoutePayloadInterface,
  SubModulePayloadInterface
} from 'src/config/permission-config';
import { PermissionEntity } from 'src/permission/entities/permission.entity';

export class PermissionSeed1673336110947 implements MigrationInterface {
  permissions: RoutePayloadInterface[] = [];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const modules = PermissionConfiguration.modules;
    for (const moduleData of modules) {
      let resource = moduleData.resource;
      this.assignResourceAndConcatPermission(moduleData, resource);

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          this.assignResourceAndConcatPermission(submodule, resource);
        }
      }
    }

    if (this.permissions && this.permissions.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(this.permissions)
        .orIgnore()
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(PermissionEntity).delete({});
  }

  private assignResourceAndConcatPermission(
    modules: ModulesPayloadInterface | SubModulePayloadInterface,
    resource: string,
    isDefault?: false
  ) {
    if (modules.permissions) {
      for (const permission of modules.permissions) {
        this.concatPermissions(permission, resource, isDefault);
      }
    }
  }

  private concatPermissions(
    permission: PermissionPayload,
    resource: string,
    isDefault: boolean
  ) {
    const description = permission.name;
    for (const data of permission.route) {
      data.resource = data.resource || resource;
      data.description = data.description || description;
      data.isDefault = isDefault;
    }
    this.permissions = this.permissions.concat(permission.route);
  }
}
