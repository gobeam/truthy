import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import {
  ownerUserGroupsForSerializing,
  UserSerializer
} from './serializer/user.serializer';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectLiteral } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as config from 'config';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UserStatusEnum } from './user-status.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

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
    const token = await this.generateUniqueToken(12);
    await this.userRepository.store(createUserDto, token);
    const mailConfig = config.get('mail');
    const appConfig = config.get('app');
    const subject = 'Account created';
    const { username, email } = createUserDto;
    await this.mailerService.sendMail({
      to: email,
      from: mailConfig.fromMail,
      subject,
      template: __dirname + '/../templates/email/activate-account',
      context: {
        email,
        activateUrl: `${appConfig.appUrl}/auth/activate-account?token=${token}`,
        username: username,
        subject
      }
    });
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
    return this.userRepository.transform(user, {
      groups: ownerUserGroupsForSerializing
    });
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

  /**
   * activate newly register account
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const user = await this.userRepository.findOne({ token });
    if (!user) {
      throw new NotFoundException();
    }
    if (user.status !== UserStatusEnum.INACTIVE) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    user.status = UserStatusEnum.ACTIVE;
    user.token = await this.generateUniqueToken(6);
    user.skipHashPassword = true;
    await user.save();
  }

  /**
   * forget password and send reset code by email
   * @param forgetPasswordDto
   */
  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }
    user.token = await this.generateUniqueToken(6);
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);
    user.tokenValidityDate = currentDateTime;
    user.skipHashPassword = true;
    await user.save();
    const mailConfig = config.get('mail');
    const subject = 'Reset Password';
    await this.mailerService.sendMail({
      to: user.email,
      from: mailConfig.fromMail,
      subject,
      template: __dirname + '/../templates/email/password-reset',
      context: {
        code: user.token,
        username: user.name,
        subject
      }
    });
  }

  /**
   * reset password using token
   * @param resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password } = resetPasswordDto;
    const user = await this.userRepository.getUserForResetPassword(
      resetPasswordDto
    );
    if (!user) {
      throw new NotFoundException();
    }
    user.token = await this.generateUniqueToken(6);
    user.password = password;
    await user.save();
  }

  /**
   * change password of logged in user
   * @param user
   * @param changePasswordDto
   */
  async changePassword(
    user: UserEntity,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;
    const checkOldPwdMatches = await user.validatePassword(oldPassword);
    if (!checkOldPwdMatches) {
      throw new UnauthorizedException();
    }
    user.password = password;
    await user.save();
  }

  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';
    if (uppercase) {
      characters += upperCaseAlphabets;
    }
    if (lowercase) {
      characters += lowerCaseAlphabets;
    }
    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * generate unique token
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    const token = this.generateRandomCode(length);
    const condition: ObjectLiteral = {
      token
    };
    const tokenCount = await this.userRepository.countEntityByCondition(
      condition,
      0
    );
    if (tokenCount > 0) {
      this.generateUniqueToken(length);
    }
    return token;
  }
}
