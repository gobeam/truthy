import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
