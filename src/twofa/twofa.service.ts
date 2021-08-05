import { HttpStatus, Injectable } from '@nestjs/common';
import * as config from 'config';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { StatusCodesList } from '../common/constants/status-codes-list.constants';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../auth/entity/user.entity';
import { CustomHttpException } from '../exception/custom-http.exception';

const TwofaConfig = config.get('twofa');

@Injectable()
export class TwofaService {
  constructor(private readonly usersService: AuthService) {}

  public async generateTwoFASecret(user: UserEntity) {
    if (user.twoFAThrottleTime > new Date()) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${this.differentBetweenDatesInSec(
          user.twoFAThrottleTime,
          new Date()
        )}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      TwofaConfig.authenticationAppNAme,
      secret
    );
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return {
      secret,
      otpauthUrl
    };
  }

  public isTwoFACodeValid(twoFASecret: string, user: UserEntity) {
    return authenticator.verify({
      token: twoFASecret,
      secret: user.twoFASecret
    });
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  differentBetweenDatesInSec(initialDate: Date, endDate: Date): number {
    const diffInSeconds = Math.abs(initialDate.getTime() - endDate.getTime());
    return Math.round(diffInSeconds / 1000);
  }
}
