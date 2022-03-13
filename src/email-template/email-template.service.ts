import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, ObjectLiteral } from 'typeorm';

import { CreateEmailTemplateDto } from 'src/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/email-template/dto/update-email-template.dto';
import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { EmailTemplate } from 'src/email-template/serializer/email-template.serializer';
import { EmailTemplatesSearchFilterDto } from 'src/email-template/dto/email-templates-search-filter.dto';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { Pagination } from 'src/paginate';

@Injectable()
export class EmailTemplateService
  implements CommonServiceInterface<EmailTemplate>
{
  constructor(
    @InjectRepository(EmailTemplateRepository)
    private readonly repository: EmailTemplateRepository
  ) {}

  /**
   * convert string to slug
   * @param text
   */
  slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Find Email Template By Slug
   * @param slug
   */
  async findBySlug(slug) {
    return await this.repository.findOne({
      select: ['body'],
      where: {
        slug
      }
    });
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  create(
    createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.repository.createEntity({
      ...createEmailTemplateDto,
      slug: this.slugify(createEmailTemplateDto.title)
    });
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  findAll(
    filter: EmailTemplatesSearchFilterDto
  ): Promise<Pagination<EmailTemplate>> {
    return this.repository.paginate(
      filter,
      [],
      ['title', 'subject', 'body', 'sender']
    );
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  findOne(id: number): Promise<EmailTemplate> {
    return this.repository.get(id);
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: number,
    updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    const template = await this.repository.get(id);
    const condition: ObjectLiteral = {
      title: updateEmailTemplateDto.title
    };
    condition.id = Not(id);
    const countSameDescription = await this.repository.countEntityByCondition(
      condition
    );
    if (countSameDescription > 0) {
      throw new UnprocessableEntityException({
        property: 'title',
        constraints: {
          unique: 'already taken'
        }
      });
    }
    return this.repository.updateEntity(template, {
      ...updateEmailTemplateDto,
      slug: this.slugify(updateEmailTemplateDto.title)
    });
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError
      );
    }
    await this.repository.delete({ id });
  }
}
