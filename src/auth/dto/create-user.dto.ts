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
import { UniqueValidatorPipe } from '../../common/pipes/unique-validator.pipe';
import { UserEntity } from '../entity/user.entity';

/**
 * create user data transform object
 */
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @Validate(UniqueValidatorPipe, [UserEntity])
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  @Validate(UniqueValidatorPipe, [UserEntity])
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
