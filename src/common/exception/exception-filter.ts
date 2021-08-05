import { I18nService } from 'nestjs-i18n';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CommonExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    let message = exception.getResponse() as {
      key: string;
      args: Record<string, any>;
    };

    message = await this.i18n.translate(message.key, {
      lang: ctx.getRequest().i18nLang,
      args: message.args
    });

    response.status(statusCode).json({
      statusCode,
      message
    });
  }
}
