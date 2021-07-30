import { Test, TestingModule } from '@nestjs/testing';
import { TwofaService } from './twofa.service';
import { AuthService } from '../auth/auth.service';
import { authenticator } from 'otplib';
import { UserEntity } from '../auth/entity/user.entity';

const authServiceMock = () => ({
  setTwoFactorAuthenticationSecret: jest.fn()
});

describe('TwofaService', () => {
  let service: TwofaService, authService, user: UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwofaService,
        { provide: AuthService, useFactory: authServiceMock }
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

  it('should generate 2fa secret', async () => {
    jest.spyOn(authenticator, 'generateSecret').mockReturnValue('result');
    jest.spyOn(authenticator, 'keyuri').mockReturnValue('result');
    await service.generateTwoFASecret(user);
    expect(authenticator.generateSecret).toHaveBeenCalledTimes(1);
    expect(authenticator.keyuri).toHaveBeenCalledTimes(1);
    expect(authService.setTwoFactorAuthenticationSecret).toHaveBeenCalledTimes(
      1
    );
  });

  it('isTwoFACodeValid', async () => {
    jest.spyOn(authenticator, 'verify').mockReturnValue(true);
    service.isTwoFACodeValid('secret', user);
    expect(authenticator.verify).toHaveBeenCalledTimes(1);
  });
});
