import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserSerializer } from './serializer/user.serializer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async addUser(createUserDto: CreateUserDto): Promise<void> {
    return this.userRepository.store(createUserDto);
  }

  async findBy(field: string, value: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { [field]: value } });
  }

  async login(userLoginDto: UserLoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.login(userLoginDto);
    const payload: JwtPayloadDto = {
      username: user.username,
      name: user.name
    };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  async get(user: UserEntity): Promise<UserSerializer> {
    return this.userRepository.transform(user);
  }
}
