import { Test } from '@nestjs/testing';

import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { UserRepository } from 'src/auth/user.repository';
import { UserEntity } from 'src/auth/entity/user.entity';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';

const mockUserRepository = () => ({
  findOne: jest.fn()
});

describe('Test JWT strategy', () => {
  let userRepository, jwtStrategy: JwtStrategy;
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
          provide: UserRepository,
          useFactory: mockUserRepository
        }
      ]
    }).compile();
    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate user', () => {
    it('should return user if username is found on database', async () => {
      const user = new UserEntity();
      user.name = 'test';
      user.username = 'tester';
      const payload: JwtPayloadDto = {
        subject: '1'
      };
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate(payload);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        Number(payload.subject),
        {
          relations: ['role', 'role.permission']
        }
      );
      expect(result).toEqual(user);
    });

    it('should throw error if subject is not found on database', async () => {
      const payload: JwtPayloadDto = {
        subject: '1'
      };
      userRepository.findOne.mockResolvedValue(null);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
