import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * forget password data transfer object
 */
export class ForgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
