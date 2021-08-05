import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTitleList } from '../common/constants/exception-title-list.constants';
import { StatusCodesList } from '../common/constants/status-codes-list.constants';

export class ForbiddenException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.Forbidden,
        code: code || StatusCodesList.Forbidden,
        statusCode: HttpStatus.FORBIDDEN,
        error: true,
      },
      HttpStatus.FORBIDDEN
    );
  }
}
