import { CreateEmailTemplateDto } from 'src/email-template/dto/create-email-template.dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class UpdateEmailTemplateDto extends PartialType(
  CreateEmailTemplateDto
) {
  @ApiPropertyOptional()
  @Optional()
  @IsString()
  title: string;
}
