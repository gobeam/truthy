import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nExceptionFilterPipe implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    return response
      .status(exception.getStatus())
      .json(await this.getMessage(exception, ctx.getRequest().i18nLang));
  }

  async getMessage(exception: HttpException, lang: string) {
    const exceptionResponse = exception.getResponse() as any;
    if (exceptionResponse.hasOwnProperty('message')) {
      if (exceptionResponse.message instanceof Array) {
        exceptionResponse.message = await this.translateArray(
          exceptionResponse.message,
          lang
        );
      } else if (typeof exceptionResponse.message === 'string') {
        exceptionResponse.message = await this.i18n.translate(
          `exception.${exceptionResponse.message}`,
          { lang }
        );
      }
    }
    return exceptionResponse;
  }

  checkIfConstraintAvailable(message: string): {
    title: string;
    argument: Record<string, any>;
  } {
    try {
      const splitObject = message.split('-');
      if (!splitObject[1]) {
        return { title: splitObject[0], argument: {} };
      }
      return {
        title: splitObject[0],
        argument: JSON.parse(splitObject[1])
      };
    } catch (e) {
      return { title: message, argument: {} };
    }
  }

  async translateArray(errors: any[], lang: string) {
    const data = {};
    for (let i = 0; i < errors.length; i++) {
      const notHandleValidators = [
        'validate',
        'isEqualTo',
        'isIn',
        'matches',
        'maxLength',
        'minLength'
      ];
      const item = errors[i];
      // console.log(item);
      const message = await Promise.all(
        Object.keys(item.constraints).map(async (key: string) => {
          let validationKey: string = key,
            validationArgument: Record<string, any> = {};
          if (notHandleValidators.includes(key)) {
            const { title, argument } = this.checkIfConstraintAvailable(
              item.constraints[key]
            );
            validationKey = title;
            validationArgument = argument;
          }
          return this.i18n.translate(`validation.${validationKey}`, {
            lang,
            args: {
              ...validationArgument,
              property: item.property
            }
          });
        })
      );
      data[item.property] = message.join('. ').trim();
    }
    return data;
  }
}
