import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { BaseRepository } from 'src/common/repository/base.repository';
import { Permission } from 'src/permission/serializer/permission.serializer';
import { RoutePayloadInterface } from 'src/config/permission-config';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/entity/user.entity';

@Injectable()
export class PermissionRepository extends BaseRepository<
  PermissionEntity,
  Permission
> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }
  async syncPermission(
    permissionsList: RoutePayloadInterface[]
  ): Promise<void> {
    await this.createQueryBuilder('permission')
      .insert()
      .into(PermissionEntity)
      .values(permissionsList)
      .orIgnore()
      .execute();
  }

  transform(model: PermissionEntity, transformOption = {}): Permission {
    return plainToInstance(
      Permission,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: PermissionEntity[],
    transformOption = {}
  ): Permission[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
