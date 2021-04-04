import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from './dto/user-login.dto';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UnprocessableEntityException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  store: jest.fn(),
  login: jest.fn(),
  transform: jest.fn(),
  findBy: jest.fn(),
  updateEntity: jest.fn(),
  countEntityByCondition: jest.fn()
});
const mockUser = {
  email: 'test@mail.com',
  username: 'tester',
  name: 'test',
  password: 'test123',
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: jwtServiceMock },
        { provide: MailerService, useFactory: mailServiceMock }
      ]
    }).compile();

    service = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
    jwtService = await module.get<JwtService>(JwtService);
    mailService = await module.get<MailerService>(MailerService);
  });

  describe('change or forgot password', () => {
    it('reset', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      const resetPasswordDto: ResetPasswordDto = {
        email: 'truthycms@gmail.com'
      };
      await service.forgotPassword(resetPasswordDto);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalled();
    });
    it('check if generate code works as expected', () => {
      const result = service.generateRandomCode(5);
      expect(typeof result).toBe('string');
      expect(result.length).toEqual(5);
    });
  });

  describe('addUser', () => {
    it('add new user test', async () => {
      const createUserDto: CreateUserDto = mockUser;
      await service.addUser(createUserDto);
      expect(userRepository.store).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.store).not.toThrow();
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

    it('update user with non duplicate username & email', async () => {
      userRepository.updateEntity.mockResolvedValue(mockUser);
      userRepository.countEntityByCondition.mockResolvedValue(0);
      const updateUserDto: UpdateUserDto = {
        email: 'test@test.com',
        username: 'tester123',
        name: 'tester'
      };
      await service.update(user, updateUserDto);
      expect(userRepository.countEntityByCondition).toHaveBeenCalledTimes(2);
      expect(userRepository.updateEntity).toHaveBeenCalledTimes(1);
      expect(userRepository.updateEntity).toHaveBeenCalledWith(
        user,
        updateUserDto
      );
      expect(userRepository.updateEntity).not.toThrow();
    });

    it('update user with duplicate username & email', async () => {
      userRepository.countEntityByCondition.mockResolvedValue(1);
      const updateUserDto: UpdateUserDto = {
        email: 'test@test.com',
        username: 'tester123',
        name: 'tester'
      };
      await expect(service.update(user, updateUserDto)).rejects.toThrowError(
        UnprocessableEntityException
      );
      expect(userRepository.countEntityByCondition).toHaveBeenCalledTimes(2);
    });
  });
});
