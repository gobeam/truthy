import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import * as config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { MailJobInterface } from './interface/mail-job.interface';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(config.get('mail.queueName')) private mailQueue: Queue
  ) {}

  async sendMail(payload: MailJobInterface, type: string): Promise<boolean> {
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
