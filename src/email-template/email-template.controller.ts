import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../common/guard/permission.guard';
import { Pagination } from '../paginate';
import { EmailTemplate } from './serializer/email-template.serializer';
import { EmailTemplatesSearchFilterDto } from './dto/email-templates-search-filter.dto';
import JwtTwoFactorGuard from '../common/guard/jwt-two-factor.guard';

@ApiTags('email-templates')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  create(
    @Body() createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.emailTemplateService.create(createEmailTemplateDto);
  }

  @Get()
  findAll(
    @Query() filter: EmailTemplatesSearchFilterDto
  ): Promise<Pagination<EmailTemplate>> {
    return this.emailTemplateService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EmailTemplate> {
    return this.emailTemplateService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.emailTemplateService.update(+id, updateEmailTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.emailTemplateService.remove(+id);
  }
}
