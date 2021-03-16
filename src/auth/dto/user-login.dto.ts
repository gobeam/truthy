import { IsNotEmpty } from 'class-validator';

/**
 * user login data transfer object
 */
export class UserLoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
