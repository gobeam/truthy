import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import * as config from 'config';
import { InjectQueue } from '@nestjs/bull';

import { MailJobInterface } from 'src/mail/interface/mail-job.interface';
import { EmailTemplateService } from 'src/email-template/email-template.service';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(config.get('mail.queueName'))
    private mailQueue: Queue,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  /**
   * Replace place holder
   * @param str
   * @param obj
   */
  stringInject(str = '', obj = {}) {
    let newStr = str;
    Object.keys(obj).forEach((key) => {
      const placeHolder = `{{${key}}}`;
      if (newStr.includes(placeHolder)) {
        newStr = newStr.replace(placeHolder, obj[key] || ' ');
      }
    });
    return newStr;
  }

  async sendMail(payload: MailJobInterface, type: string): Promise<boolean> {
    const mailBody = await this.emailTemplateService.findBySlug(payload.slug);
    payload.context.content = this.stringInject(mailBody.body, payload.context);
    if (mailBody) {
      try {
        await this.mailQueue.add(type, {
          payload
        });
        return true;
      } catch (error) {
        return false;
      }
    }
  }
}
