import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { EmailTemplateEntity } from 'src/email-template/entities/email-template.entity';

export class CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(UniqueValidatorPipe, [EmailTemplateEntity], {
    message: 'already taken'
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  sender: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50, {
    message: 'minLength-{"ln":50,"count":50}'
  })
  body: string;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}
