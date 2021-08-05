import { BaseRepository } from '../common/repository/base.repository';
import { EntityRepository } from 'typeorm';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { EmailTemplate } from './serializer/email-template.serializer';
import { classToPlain, plainToClass } from 'class-transformer';

@EntityRepository(EmailTemplateEntity)
export class EmailTemplateRepository extends BaseRepository<EmailTemplateEntity, EmailTemplate> {
  transform(model: EmailTemplateEntity, transformOption = {}): EmailTemplate {
    return plainToClass(EmailTemplate, classToPlain(model, transformOption), transformOption);
  }

  transformMany(models: EmailTemplateEntity[], transformOption = {}): EmailTemplate[] {
    return models.map(model => this.transform(model, transformOption));
  }
}
