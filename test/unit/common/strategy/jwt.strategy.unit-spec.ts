import { Test } from '@nestjs/testing';

import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { UserEntity } from 'src/auth/entity/user.entity';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { AuthService } from 'src/auth/auth.service';

const authServiceMock = () => ({
  findOne: jest.fn()
});

describe('Test JWT strategy', () => {
  let authService, jwtStrategy: JwtStrategy;
  beforeEach(async () => {
    jest.mock('config', () => ({
      default: {
        get: () => jest.fn().mockImplementation(() => 'hello')
      }
    }));
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useFactory: authServiceMock
        }
      ]
    }).compile();
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  describe('validate user', () => {
    it('should return user if username is found on database', async () => {
      const user = new UserEntity();
      user.name = 'test';
      user.username = 'tester';
      const payload: JwtPayloadDto = {
        subject: '1'
      };
      authService.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate(payload);
      expect(authService.findOne).toHaveBeenCalledWith(
        Number(payload.subject),
        ['role', 'role.permission']
      );
      expect(result).toEqual(user);
    });

    it('should throw error if subject is not found on database', async () => {
      const payload: JwtPayloadDto = {
        subject: '1'
      };
      authService.findOne.mockResolvedValue(null);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
