import { OmitType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

/**
 * update user data transfer object
 */
export class UpdateUserProfileDto extends OmitType(UpdateUserDto, [
  'status'
] as const) {}
