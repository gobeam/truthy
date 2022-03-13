import { Test } from '@nestjs/testing';

import { UserRepository } from 'src/auth/user.repository';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

const mockUser = {
  roleId: 1,
  email: 'test@email.com',
  username: 'tester',
  name: 'test',
  status: UserStatusEnum.ACTIVE,
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
        ...mockUser,
        remember: true
      };
    });
    it('check if username and password matches and return user', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      const result = await userRepository.login(userLoginDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            username: userLoginDto.username
          },
          {
            email: userLoginDto.username
          }
        ]
      });
      expect(result).toEqual([user, null, null]);
    });

    it('throw error if username and password does not matches', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.login(userLoginDto);
      expect(result).toEqual([
        null,
        ExceptionTitleList.InvalidCredentials,
        StatusCodesList.InvalidCredentials
      ]);
    });

    it('check if user is null', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.login(userLoginDto);
      expect(result).toEqual([
        null,
        ExceptionTitleList.InvalidCredentials,
        StatusCodesList.InvalidCredentials
      ]);
    });
  });
});
