import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as config from 'config';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { EmailTemplateModule } from '../email-template/email-template.module';

const mailConfig = config.get('mail');
const queueConfig = config.get('queue');

@Module({
  imports: [
    EmailTemplateModule,
    BullModule.registerQueueAsync({
      name: config.get('mail.queueName'),
      useFactory: () => ({
        redis: {
          host: queueConfig.host,
          port: queueConfig.port,
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          }
        }
      })
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: mailConfig.host,
          port: mailConfig.port,
          secure: mailConfig.secure,
          ignoreTLS: mailConfig.ignoreTLS,
          auth: {
            user: mailConfig.user,
            pass: mailConfig.pass
          }
        },
        defaults: {
          from: `"${mailConfig.from}" <${mailConfig.fromMail}>`
        },
        preview: mailConfig.preview,
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [MailService, MailProcessor],
  exports: [MailService]
})
export class MailModule {}
