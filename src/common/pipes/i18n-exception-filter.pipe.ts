import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { ValidationErrorInterface } from 'src/common/interfaces/validation-error.interface';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch(HttpException)
export class I18nExceptionFilterPipe implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly i18n: I18nService
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    return response
      .status(exception.getStatus())
      .json(
        await this.getMessage(
          exception,
          ctx.getRequest().i18nLang || ctx.getRequest().headers['x-custom-lang']
        )
      );
  }

  async getMessage(exception: HttpException, lang: string) {
    try {
      const exceptionResponse = exception.getResponse() as any;
      if (!exceptionResponse.message && typeof exceptionResponse === 'string') {
        return await this.i18n.translate(`exception.${exceptionResponse}`, {
          lang,
          args: {}
        });
      }
      if (exceptionResponse.statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
        if (
          exceptionResponse.hasOwnProperty('message') &&
          exceptionResponse.message instanceof Array
        ) {
          exceptionResponse.code = StatusCodesList.ValidationError;
          exceptionResponse.message = await this.translateArray(
            exceptionResponse.message,
            lang
          );
        }
        return exceptionResponse;
      }
      let errorMessage = 'internalError';
      if (exceptionResponse.message instanceof Array) {
        errorMessage = exceptionResponse.message[0];
      } else if (typeof exceptionResponse.message === 'string') {
        errorMessage = exceptionResponse.message;
      } else if (
        !exceptionResponse.message &&
        typeof exceptionResponse === 'string'
      ) {
        errorMessage = exceptionResponse;
      }

      const { title, argument } = this.checkIfConstraintAvailable(errorMessage);
      exceptionResponse.message = await this.i18n.translate(
        `exception.${title}`,
        {
          lang,
          args: {
            ...argument
          }
        }
      );
      return exceptionResponse;
    } catch (error) {
      this.logger.error('Error in I18nExceptionFilterPipe: ', {
        meta: {
          error
        }
      });
    }
  }

  checkIfConstraintAvailable(message: string): {
    title: string;
    argument: Record<string, any>;
  } {
    try {
      const splitObject = message.split('-');
      if (!splitObject[1]) {
        return {
          title: splitObject[0],
          argument: {}
        };
      }
      return {
        title: splitObject[0],
        argument: JSON.parse(splitObject[1])
      };
    } catch (e) {
      return {
        title: message,
        argument: {}
      };
    }
  }

  async translateArray(errors: any[], lang: string) {
    const validationData: Array<ValidationErrorInterface> = [];
    for (let i = 0; i < errors.length; i++) {
      const constraintsValidator = [
        'validate',
        'isEqualTo',
        'isIn',
        'matches',
        'maxLength',
        'minLength',
        'isLength'
      ];
      const item = errors[i];
      let message = [];
      if (item.constraints) {
        message = await Promise.all(
          Object.keys(item.constraints).map(async (key: string) => {
            let validationKey: string = key,
              validationArgument: Record<string, any> = {};
            if (constraintsValidator.includes(key)) {
              const { title, argument } = this.checkIfConstraintAvailable(
                item.constraints[key]
              );
              validationKey = title;
              validationArgument = argument;
            }
            const args: Record<string, any> = {
              lang,
              args: {
                property: item.property
              }
            };
            if (
              validationArgument &&
              Object.keys(validationArgument).length > 0
            ) {
              args.args = {
                ...validationArgument,
                property: item.property
              };
            }
            return this.i18n.translate(`validation.${validationKey}`, args);
          })
        );
      }

      validationData.push({
        name: item.property,
        errors: message
      });
    }
    return validationData;
  }
}
