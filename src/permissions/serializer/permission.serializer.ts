import { ModelSerializer } from '../../common/serializer/model.serializer';
import { ApiProperty } from '@nestjs/swagger';

export class Permission extends ModelSerializer {
  @ApiProperty()
  resource: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  isDefault: boolean;
}
