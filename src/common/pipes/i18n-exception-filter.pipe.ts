import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ValidationErrorInterface } from '../interfaces/validation-error.interface';
import { StatusCodesList } from '../constants/status-codes-list.constants';

@Catch(HttpException)
export class I18nExceptionFilterPipe implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    return response
      .status(exception.getStatus())
      .json(await this.getMessage(exception, ctx.getRequest().i18nLang || ctx.getRequest().headers['x-custom-lang']));
  }

  async getMessage(exception: HttpException, lang: string) {
    const exceptionResponse = exception.getResponse() as any;
    if (exceptionResponse.hasOwnProperty('message')) {
      if (exceptionResponse.message instanceof Array) {
        exceptionResponse.code = StatusCodesList.ValidationError;
        exceptionResponse.message = await this.translateArray(exceptionResponse.message, lang);
      } else if (typeof exceptionResponse.message === 'string') {
        const { title, argument } = this.checkIfConstraintAvailable(exceptionResponse.message);
        exceptionResponse.message = await this.i18n.translate(`exception.${title}`, { lang, args: { ...argument } });
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
        argument: JSON.parse(splitObject[1]),
      };
    } catch (e) {
      return { title: message, argument: {} };
    }
  }

  async translateArray(errors: any[], lang: string) {
    const validationData: Array<ValidationErrorInterface> = [];
    for (let i = 0; i < errors.length; i++) {
      const constraintsValidator = ['validate', 'isEqualTo', 'isIn', 'matches', 'maxLength', 'minLength'];
      const item = errors[i];
      let message = [];
      if (item.constraints) {
        message = await Promise.all(
          Object.keys(item.constraints).map(async (key: string) => {
            let validationKey: string = key,
              validationArgument: Record<string, any> = {};
            if (constraintsValidator.includes(key)) {
              const { title, argument } = this.checkIfConstraintAvailable(item.constraints[key]);
              validationKey = title;
              validationArgument = argument;
            }
            return this.i18n.translate(`validation.${validationKey}`, {
              lang,
              args: {
                ...validationArgument,
                property: item.property,
              },
            });
          })
        );
      }

      validationData.push({
        name: item.property,
        errors: message,
      });
    }
    return validationData;
  }
}
