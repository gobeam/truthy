import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserEntity } from './entity/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { UserStatusEnum } from './user-status.enum';

const mockUser = {
  email: 'test@email.com',
  username: 'tester',
  name: 'test',
  password: 'pwd'
};
describe('User Repository', () => {
  let userRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository]
    }).compile();
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('store', () => {
    let save;
    beforeEach(async () => {
      save = jest.fn().mockResolvedValue(undefined);
      userRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('store new user', async () => {
      const createUserDto: CreateUserDto = {
        ...mockUser
      };
      await expect(userRepository.store(createUserDto)).resolves.not.toThrow();
    });
  });

  describe('login', () => {
    let user, userLoginDto: UserLoginDto;
    beforeEach(async () => {
      userRepository.findOne = jest.fn();
      user = new UserEntity();
      user.status = UserStatusEnum.ACTIVE;
      user.username = mockUser.username;
      user.password = mockUser.password;
      user.validatePassword = jest.fn();
      userLoginDto = {
        ...mockUser
      };
    });
    it('check if username and password matches and return user', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      const result = await userRepository.login(userLoginDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: userLoginDto.username },
          { email: userLoginDto.username }
        ]
      });
      expect(result).toEqual(user);
    });

    it('throw error if username and password doesnot matches', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      await expect(userRepository.login(userLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('check if user is null', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(userRepository.login(userLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
