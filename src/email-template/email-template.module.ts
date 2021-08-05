import { forwardRef, Module } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UniqueValidatorPipe } from '../common/pipes/unique-validator.pipe';
import { EmailTemplateRepository } from './email-template.repository';

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
