import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';
import { EmailTemplateEntity } from 'src/email-template/entities/email-template.entity';
import { EmailTemplate } from 'src/email-template/serializer/email-template.serializer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplateRepository extends BaseRepository<
  EmailTemplateEntity,
  EmailTemplate
> {
  constructor(private dataSource: DataSource) {
    super(EmailTemplateEntity, dataSource.createEntityManager());
  }
  transform(model: EmailTemplateEntity, transformOption = {}): EmailTemplate {
    return plainToInstance(
      EmailTemplate,
      instanceToPlain(model, transformOption),
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
