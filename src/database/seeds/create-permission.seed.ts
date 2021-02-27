import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import {
  PermissionConfiguration,
  RoutePayloadInterface
} from '../../config/permission-config';
import { PermissionEntity } from '../../permissions/entities/permission.entity';

export default class CreatePermissionSeed {
  permissions: RoutePayloadInterface[] = [];
  public async run(factory: Factory, connection: Connection): Promise<any> {
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
      await connection
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(this.permissions)
        .orIgnore()
        .execute();
    }
  }

  assignResourceAndConcatPermission(modules, resource) {
    if (modules.permissions) {
      for (const permission of modules.permissions) {
        for (const data of permission.route) {
          data.resource = resource;
        }
        this.permissions = this.permissions.concat(permission.route);
      }
    }
  }
}
