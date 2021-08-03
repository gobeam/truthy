import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTitleList } from '../common/constants/exception-title-list.constants';
import { StatusCodesList } from '../common/constants/status-codes-list.constants';

export class UnauthorizedException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.Unauthorized,
        code: code || StatusCodesList.UnauthorizedAccess,
        statusCode: HttpStatus.UNAUTHORIZED,
        error: true
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}
