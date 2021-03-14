import { ModelSerializer } from '../../common/serializer/model.serializer';
import { PermissionRoleEntity } from '../entities/permission-role.entity';

export class Permission extends ModelSerializer {
  resource: string;
  description: string;
  path: string;
  method: string;
  isDefault: boolean;
  permissionRoles: PermissionRoleEntity[];
}
