import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../auth/entity/user.entity';
import { AuthService } from '../auth/auth.service';
import { authenticator } from 'otplib';
import * as config from 'config';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

const TwofaConfig = config.get('twofa');

@Injectable()
export class TwofaService {
  constructor(private readonly usersService: AuthService) {}

  public async generateTwoFASecret(user: UserEntity) {
    if (user.twoFAThrottleTime > new Date()) {
      throw new HttpException(
        {
          message: `tooManyRequest-{"second":"${this.differentBetweenDatesInSec(
            user.twoFAThrottleTime,
            new Date()
          )}"}`,
          error: true
        },
        HttpStatus.TOO_MANY_REQUESTS
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
