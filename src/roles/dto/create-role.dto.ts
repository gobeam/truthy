import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf
} from 'class-validator';
import { UniqueValidatorPipe } from '../../common/pipes/unique-validator.pipe';
import { RoleEntity } from '../entities/role.entity';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Validate(UniqueValidatorPipe, [
    RoleEntity,
    ({ object: { name } }: { object: RoleEntity }) => ({
      name
    })
  ])
  name: string;

  @ValidateIf((object, value) => value)
  @IsString()
  description: string;

  @ValidateIf((object, value) => value)
  @IsNumber({}, { each: true, message: 'should be array of numbers' })
  permissions: number[];
}
