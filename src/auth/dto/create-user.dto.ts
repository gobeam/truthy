import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator';
import { IsUsernameAlreadyExist } from '../pipes/username-unique-validation.pipes';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsUsernameAlreadyExist, {
    message: 'Username $value already exists. Choose another username.'
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/,
    {
      message:
        'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
    }
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
