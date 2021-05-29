import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from './dto/user-login.dto';
import { UserEntity } from './entity/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UserStatusEnum } from './user-status.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  get: jest.fn(),
  store: jest.fn(),
  login: jest.fn(),
  transform: jest.fn(),
  findBy: jest.fn(),
  updateEntity: jest.fn(),
  getUserForResetPassword: jest.fn(),
  countEntityByCondition: jest.fn()
});

const mockUser = {
  email: 'test@mail.com',
  username: 'tester',
  name: 'test',
  password: 'test123',
  roleId: 2,
  status: UserStatusEnum.ACTIVE,
  save: jest.fn()
};

const jwtServiceMock = () => ({
  sign: jest.fn()
});

const mailServiceMock = () => ({
  sendMail: jest.fn()
});

describe('AuthService', () => {
  let service: AuthService, userRepository, jwtService, mailService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: jwtServiceMock },
        { provide: MailService, useFactory: mailServiceMock }
      ]
    }).compile();

    service = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
    jwtService = await module.get<JwtService>(JwtService);
    mailService = await module.get<MailService>(MailService);
  });

  describe('change or forgot password', () => {
    it('forgot password with email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      const forgetPasswordDto: ForgetPasswordDto = {
        email: 'truthycms@gmail.com'
      };
      await service.forgotPassword(forgetPasswordDto);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalled();
    });
    it('check if generate code works as expected', () => {
      const result = service.generateRandomCode(5);
      expect(typeof result).toBe('string');
      expect(result.length).toEqual(5);
    });

    it('generate unique code test', async () => {
      service.generateRandomCode = jest.fn().mockReturnValue('W45Rft');
      userRepository.countEntityByCondition.mockResolvedValue(0);
      await service.generateUniqueToken(6);
      expect(service.generateRandomCode).toHaveBeenCalledWith(6);
      expect(userRepository.countEntityByCondition).toHaveBeenCalledWith({
        token: 'W45Rft'
      });
    });

    describe('reset password test', () => {
      let resetPasswordDto: ResetPasswordDto;
      beforeEach(() => {
        resetPasswordDto = {
          password: 'Truthy@123',
          confirmPassword: 'Truthy@123',
          token: 'Aer23C'
        };
      });
      it('reset password for existing user', async () => {
        userRepository.getUserForResetPassword.mockResolvedValue(mockUser);
        service.generateUniqueToken = jest.fn();
        await service.resetPassword(resetPasswordDto);
        expect(userRepository.getUserForResetPassword).toHaveBeenCalledWith(
          resetPasswordDto
        );
        expect(service.generateUniqueToken).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
      });
      it('try to reset password with invalid token', async () => {
        userRepository.getUserForResetPassword.mockResolvedValue(null);
        await expect(
          service.resetPassword(resetPasswordDto)
        ).rejects.toThrowError(NotFoundException);
      });
      describe('change password', () => {
        let user: UserEntity, changePasswordDto: ChangePasswordDto;
        beforeEach(() => {
          jest.clearAllMocks();
          changePasswordDto = {
            oldPassword: 'Truthy@prev',
            password: 'Truthy@123',
            confirmPassword: 'Truthy@123'
          };

          user = new UserEntity();
          user.email = mockUser.email;
          user.username = mockUser.username;
          user.password = mockUser.password;
          user.salt = 'result';
          user.save = mockUser.save;
        });
        it('change password for loggedin user with correct password', async () => {
          user.validatePassword = jest.fn().mockResolvedValue(true);
          bcrypt.hash = jest.fn().mockResolvedValue('result');
          await service.changePassword(user, changePasswordDto);
          expect(user.validatePassword).toHaveBeenCalledTimes(1);
          expect(user.save).toHaveBeenCalledTimes(1);
        });
        it('change password for loggedin user with incorrect password', async () => {
          bcrypt.hash = jest.fn().mockResolvedValue('result');
          user.validatePassword = jest.fn().mockResolvedValue(false);
          await expect(
            service.changePassword(user, changePasswordDto)
          ).rejects.toThrowError(UnauthorizedException);
          expect(user.validatePassword).toHaveBeenCalledTimes(1);
          expect(user.save).toHaveBeenCalledTimes(0);
        });
      });
    });
  });

  describe('addUser', () => {
    it('add new user test', async () => {
      const token = 'Adf2vBnVV';
      service.generateUniqueToken = jest.fn().mockResolvedValue(token);
      userRepository.store.mockResolvedValue(mockUser);
      const createUserDto: CreateUserDto = mockUser;
      await service.create(createUserDto);
      expect(service.generateUniqueToken).toHaveBeenCalled();
      expect(userRepository.store).toHaveBeenCalledWith(createUserDto, token);
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      expect(userRepository.store).not.toThrow();
    });

    it('activate account with valid token', async () => {
      service.generateUniqueToken = jest.fn();
      userRepository.findOne.mockResolvedValue(mockUser);
      mockUser.status = UserStatusEnum.INACTIVE; // initially user will have inactive status
      const token = 'Adf2vBnVV';
      await service.activateAccount(token);
      expect(userRepository.findOne).toHaveBeenCalledWith({ token });
      expect(service.generateUniqueToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('activate account with invalid token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const token = 'Bgf2vBnVV';
      await expect(service.activateAccount(token)).rejects.toThrowError(
        NotFoundException
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalledTimes(0);
    });
  });

  describe('findBy', () => {
    it('find user by id', async () => {
      userRepository.findBy.mockResolvedValue(mockUser);
      const result = await service.findBy('username', 'tester');
      expect(userRepository.findBy).toHaveBeenCalledWith('username', 'tester');
      expect(result).toBe(mockUser);
    });
  });

  describe('logged in user functionality', () => {
    let userLoginDto: UserLoginDto, user;
    beforeEach(() => {
      userLoginDto = {
        password: mockUser.password,
        username: mockUser.username
      };
      user = new UserEntity();
      user.id = 1;
      user.email = mockUser.email;
      user.username = mockUser.username;
      user.password = mockUser.password;
    });

    it('login user', async () => {
      userRepository.login.mockResolvedValue(user);
      jwtService.sign.mockResolvedValue('hash');
      const result = await service.login(userLoginDto);
      expect(userRepository.login).toHaveBeenCalledWith(userLoginDto);
      expect(result).toEqual({ accessToken: 'hash' });
    });

    it('get profile', async () => {
      userRepository.transform.mockResolvedValue(mockUser);
      await service.get(user);
      expect(userRepository.transform).toHaveBeenCalledTimes(1);
    });

    it('get user by id', async () => {
      userRepository.get.mockResolvedValue(mockUser);
      await service.findById(1);
      expect(userRepository.get).toHaveBeenCalledTimes(1);
    });

    it('update user with non duplicate username & email', async () => {
      userRepository.updateEntity.mockResolvedValue(mockUser);
      userRepository.get.mockResolvedValue(mockUser);
      userRepository.countEntityByCondition.mockResolvedValue(0);
      const updateUserDto: UpdateUserProfileDto = {
        email: 'test@test.com',
        username: 'tester123',
        name: 'tester',
        roleId: 2
      };
      await service.update(user.id, updateUserDto);
      expect(userRepository.countEntityByCondition).toHaveBeenCalledTimes(2);
      expect(userRepository.updateEntity).toHaveBeenCalledTimes(1);
      expect(userRepository.updateEntity).toHaveBeenCalledWith(
        mockUser,
        updateUserDto
      );
      expect(userRepository.updateEntity).not.toThrow();
    });

    it('update user with duplicate username & email', async () => {
      userRepository.countEntityByCondition.mockResolvedValue(1);
      const updateUserDto: UpdateUserProfileDto = {
        email: 'test@test.com',
        username: 'tester123',
        name: 'tester',
        roleId: 2
      };
      userRepository.get.mockResolvedValue(mockUser);
      await expect(service.update(user, updateUserDto)).rejects.toThrowError(
        UnprocessableEntityException
      );
      expect(userRepository.countEntityByCondition).toHaveBeenCalledTimes(2);
    });
  });
});
