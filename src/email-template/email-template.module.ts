import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailTemplateService } from 'src/email-template/email-template.service';
import { EmailTemplateController } from 'src/email-template/email-template.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { EmailTemplateRepository } from 'src/email-template/email-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplateRepository]),
    forwardRef(() => AuthModule)
  ],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService, UniqueValidatorPipe]
})
export class EmailTemplateModule {}
