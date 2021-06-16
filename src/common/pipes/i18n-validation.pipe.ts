import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnprocessableEntityException
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nValidationPipe implements PipeTransform<any> {
  constructor(private readonly i18n: I18nService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new UnprocessableEntityException(
        await this.translateErrors(errors),
        await this.i18n.translate('exceptions.unprocessableEntity')
      );
    }
    return value;
  }

  private toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  async translateErrors(errors: ValidationError[]) {
    const data = [];
    for (const error of errors) {
      const message = await Promise.all(
        Object.keys(error.constraints).map(async (key: string) =>
          this.i18n.translate(`validation.${key}`, {
            args: {
              property: error.property
            }
          })
        )
      );
      data.push({ field: error.property, message });
    }
    return data;
  }
}
