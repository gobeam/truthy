import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * reset password data transfer object
 */
export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
