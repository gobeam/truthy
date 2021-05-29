import { IsIn, IsNumber, IsNumberString } from 'class-validator';
import { UserStatusEnum } from '../user-status.enum';
import { OmitType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';

/**
 * create user data transform object
 */
export class CreateUserDto extends OmitType(RegisterUserDto, [
  'password'
] as const) {
  @IsIn([
    UserStatusEnum.ACTIVE,
    UserStatusEnum.INACTIVE,
    UserStatusEnum.BLOCKED
  ])
  status: UserStatusEnum;

  @IsNumberString()
  roleId: number;
}
