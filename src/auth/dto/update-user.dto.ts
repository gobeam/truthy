import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * update user data transfer object
 */
export class UpdateUserDto {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  username: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  name: string;
}
