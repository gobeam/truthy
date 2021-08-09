import { IsLowercase, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * user login data transfer object
 */
export class UserLoginDto {
  @IsNotEmpty()
  @IsLowercase()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsBoolean()
  remember: boolean;
}
