import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate
} from 'class-validator';
import { MethodList } from '../../config/permission-config';
import { UniqueValidatorPipe } from '../../common/pipes/unique-validator.pipe';
import { PermissionEntity } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  resource: string;

  @IsNotEmpty()
  @IsString()
  @Validate(UniqueValidatorPipe, [PermissionEntity], {
    message: 'already taken'
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  path: string;

  @IsNotEmpty()
  @IsEnum(MethodList)
  method: MethodList;
}
