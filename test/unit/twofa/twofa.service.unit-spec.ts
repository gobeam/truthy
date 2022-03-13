import { Test, TestingModule } from '@nestjs/testing';
import { authenticator } from 'otplib';

import { TwofaService } from 'src/twofa/twofa.service';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomHttpException } from 'src/exception/custom-http.exception';

const authServiceMock = () => ({
  setTwoFactorAuthenticationSecret: jest.fn()
});

describe('TwofaService', () => {
  let service: TwofaService, authService, user: UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwofaService,
        {
          provide: AuthService,
          useFactory: authServiceMock
        }
      ]
    }).compile();

    service = module.get<TwofaService>(TwofaService);
    authService = await module.get<AuthService>(AuthService);
    user = new UserEntity();
    user.email = 'test@mail.com';
    user.username = 'tester';
    user.password = 'pwd';
    user.salt = 'result';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#generateSecret', () => {
    it('should throw error if user tries to spam generate OTP', async () => {
      const twoFAThrottleTime = new Date();
      twoFAThrottleTime.setSeconds(twoFAThrottleTime.getSeconds() + 60);
      user.twoFAThrottleTime = twoFAThrottleTime;
      await expect(service.generateTwoFASecret(user)).rejects.toThrowError(
        CustomHttpException
      );
    });
    it('should generate 2fa secret', async () => {
      jest.spyOn(authenticator, 'generateSecret').mockReturnValue('result');
      jest.spyOn(authenticator, 'keyuri').mockReturnValue('result');
      await service.generateTwoFASecret(user);
      expect(authenticator.generateSecret).toHaveBeenCalledTimes(1);
      expect(authenticator.keyuri).toHaveBeenCalledTimes(1);
      expect(
        authService.setTwoFactorAuthenticationSecret
      ).toHaveBeenCalledTimes(1);
    });
  });

  it('isTwoFACodeValid', async () => {
    jest.spyOn(authenticator, 'verify').mockReturnValue(true);
    service.isTwoFACodeValid('secret', user);
    expect(authenticator.verify).toHaveBeenCalledTimes(1);
  });
});
