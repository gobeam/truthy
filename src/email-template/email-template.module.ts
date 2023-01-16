import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailTemplateService } from 'src/email-template/email-template.service';
import { EmailTemplateController } from 'src/email-template/email-template.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
import { EmailTemplateEntity } from './entities/email-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplateEntity]),
    forwardRef(() => AuthModule)
  ],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [
    EmailTemplateRepository,
    EmailTemplateService,
    UniqueValidatorPipe
  ]
})
export class EmailTemplateModule {}
