import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new ForbiddenException('tokenExpired');
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
