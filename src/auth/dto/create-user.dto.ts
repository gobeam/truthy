import { IsIn, IsNumber } from 'class-validator';
import { UserStatusEnum } from '../user-status.enum';
import { OmitType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';

const statusEnumArray = [UserStatusEnum.ACTIVE, UserStatusEnum.INACTIVE, UserStatusEnum.BLOCKED];

/**
 * create user data transform object
 */
export class CreateUserDto extends OmitType(RegisterUserDto, ['password'] as const) {
  @IsIn(statusEnumArray, {
    message: `isIn-{"items":"${statusEnumArray.join(',')}"}`,
  })
  status: UserStatusEnum;

  @IsNumber()
  roleId: number;
}
