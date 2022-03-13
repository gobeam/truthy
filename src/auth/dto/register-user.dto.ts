import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator';

import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { UserEntity } from 'src/auth/entity/user.entity';

/**
 * register user data transform object
 */
export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @Validate(UniqueValidatorPipe, [UserEntity], {
    message: 'already taken'
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  @Validate(UniqueValidatorPipe, [UserEntity], {
    message: 'already taken'
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'minLength-{"ln":6,"count":6}'
  })
  @MaxLength(20, {
    message: 'maxLength-{"ln":20,"count":20}'
  })
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
