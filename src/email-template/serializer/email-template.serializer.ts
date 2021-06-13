import { ModelSerializer } from '../../common/serializer/model.serializer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailTemplate extends ModelSerializer {
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
