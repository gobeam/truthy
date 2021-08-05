import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';
import { ValidateIf } from 'class-validator';

/**
 * update user profile transfer object
 */
export class UpdateUserProfileDto extends OmitType(UpdateUserDto, ['status', 'roleId'] as const) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  avatar: string;
}
