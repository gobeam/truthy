import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { Pagination } from 'src/paginate';
import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { UpdateUserProfileDto } from 'src/auth/dto/update-user-profile.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserSearchFilterDto } from 'src/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { RefreshPaginateFilterDto } from 'src/refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from 'src/refresh-token/serializer/refresh-token.serializer';

@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/register')
  register(
    @Body(ValidationPipe)
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(registerUserDto);
  }

  @Post('/auth/login')
  async login(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @Body()
    userLoginDto: UserLoginDto
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const cookiePayload = await this.authService.login(
      userLoginDto,
      refreshTokenPayload
    );
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Post('/refresh')
  async refresh(
    @Req()
    req: Request,
    @Res()
    response: Response
  ) {
    try {
      const cookiePayload =
        await this.authService.createAccessTokenFromRefreshToken(
          req.cookies['Refresh']
        );
      response.setHeader('Set-Cookie', cookiePayload);
      return response.status(HttpStatus.NO_CONTENT).json({});
    } catch (e) {
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/auth/activate-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  activateAccount(
    @Query('token')
    token: string
  ): Promise<void> {
    return this.authService.activateAccount(token);
  }

  @Put('/auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(
    @Body()
    forgetPasswordDto: ForgetPasswordDto
  ): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @Put('/auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/profile')
  profile(
    @GetUser()
    user: UserEntity
  ): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/profile')
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      multerOptionsHelper('public/images/profile', 1000000)
    )
  )
  updateProfile(
    @GetUser()
    user: UserEntity,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    updateUserDto: UpdateUserProfileDto
  ): Promise<UserSerializer> {
    if (file) {
      updateUserDto.avatar = file.filename;
    }
    return this.authService.update(user.id, updateUserDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/change-password')
  changePassword(
    @GetUser()
    user: UserEntity,
    @Body()
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users')
  findAll(
    @Query()
    userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.authService.findAll(userSearchFilterDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post('/users')
  create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(createUserDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Put('/users/:id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(+id, updateUserDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users/:id')
  findOne(
    @Param('id')
    id: string
  ): Promise<UserSerializer> {
    return this.authService.findById(+id);
  }

  @Post('/logout')
  async logOut(
    @Req()
    req: Request,
    @Res()
    response: Response
  ) {
    try {
      const cookie = req.cookies['Refresh'];
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      const refreshCookie = req.cookies['Refresh'];
      if (refreshCookie) {
        await this.authService.revokeRefreshToken(cookie);
      }
      return response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (e) {
      return response.sendStatus(HttpStatus.NO_CONTENT);
    }
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/token-info')
  getRefreshToken(
    @Query()
    filter: RefreshPaginateFilterDto,
    @GetUser()
    user: UserEntity
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.authService.activeRefreshTokenList(+user.id, filter);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/revoke/:id')
  revokeToken(
    @Param('id')
    id: string,
    @GetUser()
    user: UserEntity
  ) {
    return this.authService.revokeTokenById(+id, user.id);
  }
}
