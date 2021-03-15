import { UserEntity } from './entity/user.entity';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

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
        { provide: UserRepository, useFactory: mockUserRepository }
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
        username: 'tester',
        name: 'test'
      };
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate(payload);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: payload.username
      });
      expect(result).toEqual(user);
    });

    it('should throw error if username is found on database', async () => {
      const payload: JwtPayloadDto = {
        username: 'tester',
        name: 'test'
      };
      userRepository.findOne.mockResolvedValue(null);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
