import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from './dto/user-login.dto';
import { UserEntity } from './entity/user.entity';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  store: jest.fn(),
  login: jest.fn()
});
const mockUser = {
  email: 'test@mail.com',
  username: 'tester',
  name: 'test',
  password: 'test123'
};

const jwtServiceMock = () => ({
  sign: jest.fn()
});

describe('AuthService', () => {
  let service: AuthService, userRepository, jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: jwtServiceMock }
      ]
    }).compile();

    service = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
    jwtService = await module.get<JwtService>(JwtService);
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
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findBy('username', 'tester');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'tester' }
      });
      expect(result).toBe(mockUser);
    });
  });

  describe('login', () => {
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
  });
});
