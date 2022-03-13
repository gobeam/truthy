import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';
import { EmailTemplateEntity } from 'src/email-template/entities/email-template.entity';
import { EmailTemplate } from 'src/email-template/serializer/email-template.serializer';

@EntityRepository(EmailTemplateEntity)
export class EmailTemplateRepository extends BaseRepository<
  EmailTemplateEntity,
  EmailTemplate
> {
  transform(model: EmailTemplateEntity, transformOption = {}): EmailTemplate {
    return plainToClass(
      EmailTemplate,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: EmailTemplateEntity[],
    transformOption = {}
  ): EmailTemplate[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
