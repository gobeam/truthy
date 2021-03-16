import { ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AbstractUniqueValidator } from './abstract-unique-validator';

/**
 * unique validator pipe
 */
@ValidatorConstraint({ name: 'unique', async: true })
@Injectable()
export class UniqueValidatorPipe extends AbstractUniqueValidator {
  constructor(@InjectConnection() protected readonly connection: Connection) {
    super(connection);
  }
}
