import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = ExceptionTitleList.TooManyTries;
}
