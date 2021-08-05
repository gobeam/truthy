import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { ForbiddenException } from '../../exception/forbidden.exception';
import { UnauthorizedException } from '../../exception/unauthorized.exception';
import { StatusCodesList } from '../constants/status-codes-list.constants';

@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new ForbiddenException(
        'tokenExpired',
        StatusCodesList.TokenExpired
      );
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
