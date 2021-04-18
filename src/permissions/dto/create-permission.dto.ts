import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
  ValidationArguments
} from 'class-validator';
import { MethodList } from '../../config/permission-config';
import { UniqueValidatorPipe } from '../../common/pipes/unique-validator.pipe';
import { PermissionEntity } from '../entities/permission.entity';
import { UserEntity } from '../../auth/entity/user.entity';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  resource: string;

  @IsNotEmpty()
  @IsString()
  @Validate(UniqueValidatorPipe, [PermissionEntity], {
    message: ({ value }: ValidationArguments) =>
      `permission with description ${value} already exist`
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
