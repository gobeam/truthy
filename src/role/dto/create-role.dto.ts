import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf
} from 'class-validator';

import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { RoleEntity } from 'src/role/entities/role.entity';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(UniqueValidatorPipe, [RoleEntity], {
    message: 'already taken'
  })
  name: string;

  @ValidateIf((object, value) => value)
  @IsString()
  description: string;

  @ValidateIf((object, value) => value)
  @IsNumber(
    {},
    {
      each: true,
      message: 'should be array of numbers'
    }
  )
  permissions: number[];
}
