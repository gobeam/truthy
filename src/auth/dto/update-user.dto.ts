import { IsEmail, IsString } from 'class-validator';

/**
 * update user data transfer object
 */
export class UpdateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
