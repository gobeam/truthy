import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserSerializer } from './serializer/user.serializer';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectLiteral } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as config from 'config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {}

  /**
   * add new user
   * @param createUserDto
   */
  async addUser(createUserDto: CreateUserDto): Promise<void> {
    return this.userRepository.store(createUserDto);
  }

  /**
   * find user entity by condition
   * @param field
   * @param value
   */
  async findBy(field: string, value: string): Promise<UserSerializer> {
    return await this.userRepository.findBy(field, value);
  }

  /**
   * login user
   * @param userLoginDto
   */
  async login(userLoginDto: UserLoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.login(userLoginDto);
    const payload: JwtPayloadDto = {
      username: user.username,
      name: user.name
    };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  /**
   * get user profile
   * @param user
   */
  async get(user: UserEntity): Promise<UserSerializer> {
    return this.userRepository.transform(user);
  }

  /**
   * update logged in user
   * @param user
   * @param updateUserDto
   */
  async update(
    user: UserEntity,
    updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    const checkUniqueFieldArray = ['username', 'email'];
    const error = {};
    for (const field of checkUniqueFieldArray) {
      const condition: ObjectLiteral = {
        [field]: updateUserDto[field]
      };
      const checkUnique = await this.userRepository.countEntityByCondition(
        condition,
        user.id
      );
      if (checkUnique > 0) {
        error[field] = `${field} already exists`;
      }
    }
    if (Object.keys(error).length > 0) {
      throw new UnprocessableEntityException(error);
    }
    return this.userRepository.updateEntity(user, updateUserDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email } = resetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }
    const mailConfig = config.get('mail');
    await this.mailerService.sendMail({
      to: user.email,
      from: mailConfig.fromMail,
      subject: 'Reset Password',
      template: __dirname + '/templates/email/password-reset',
      context: {
        code: 'cf1a3f828287',
        username: user.name
      }
    });
  }
}
