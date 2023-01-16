import { MigrationInterface, QueryRunner } from 'typeorm';

import templates from 'src/config/email-template';
import { EmailTemplateEntity } from 'src/email-template/entities/email-template.entity';

export class CreateEmailTemplateSeed1673336014551
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(EmailTemplateEntity)
      .values(templates)
      .orIgnore()
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(EmailTemplateEntity).delete({});
  }
}
