import {
  ValidationArguments,
  ValidatorConstraintInterface
} from 'class-validator';
import { DataSource, EntitySchema, FindManyOptions, ObjectType } from 'typeorm';

/**
 * unique validation arguments
 */
export interface UniqueValidationArguments<E> extends ValidationArguments {
  constraints: [
    ObjectType<E> | EntitySchema<E> | string,
    ((validationArguments: ValidationArguments) => FindManyOptions<E>) | keyof E
  ];
}

/**
 * abstract class to validate unique
 */
export abstract class AbstractUniqueValidator
  implements ValidatorConstraintInterface
{
  protected constructor(private readonly dataSource: DataSource) {}

  /**
   * validate method to validate provided condition
   * @param value
   * @param args
   */
  public async validate<E>(value: string, args: UniqueValidationArguments<E>) {
    const [EntityClass, findCondition = args.property] = args.constraints;
    return (
      (await this.dataSource.getRepository(EntityClass).count({
        where:
          typeof findCondition === 'function'
            ? findCondition(args)
            : {
                [findCondition || args.property]: value
              }
      } as any)) <= 0
    );
  }

  /**
   * default message
   * @param args
   */
  public defaultMessage(args: ValidationArguments) {
    return `${args.property} '${args.value}' already exists`;
  }
}
