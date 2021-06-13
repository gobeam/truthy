import { ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplateRepository } from './email-template.repository';
import { CommonServiceInterface } from '../common/interfaces/common-service.interface';
import { Pagination } from '../paginate';
import { EmailTemplate } from './serializer/email-template.serializer';
import { EmailTemplatesSearchFilterDto } from './dto/email-templates-search-filter.dto';
import { Not, ObjectLiteral } from 'typeorm';

@Injectable()
export class EmailTemplateService
  implements CommonServiceInterface<EmailTemplate> {
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
    return await this.repository.findOne({ select: ['body'], where: { slug } });
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
        title: 'already taken'
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
      throw new ForbiddenException();
    }
    await this.repository.delete({ id });
  }
}
