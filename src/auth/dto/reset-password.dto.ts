import { IsEmail } from 'class-validator';

/**
 * reset password data transfer object
 */
export class ResetPasswordDto {
  @IsEmail()
  email: string;
}
