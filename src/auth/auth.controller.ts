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
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from './entity/user.entity';
import { UserSerializer } from './serializer/user.serializer';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PermissionGuard } from '../common/guard/permission.guard';
import { Pagination } from '../paginate';
import { Response, Request } from 'express';
import { UserSearchFilterDto } from './dto/user-search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';

@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/register')
  register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(registerUserDto);
  }

  @Post('/auth/login')
  async login(
    @Req() req: Request,
    @Res() response: Response,
    @Body() userLoginDto: UserLoginDto
  ) {
    console.log("userLoginDtouserLoginDto", userLoginDto)
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    const cookiePayload = await this.authService.login(
      userLoginDto,
      refreshTokenPayload
    );
    response.setHeader('Set-Cookie', cookiePayload);
    return response.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('/auth/profile')
  profile(@GetUser() user: UserEntity): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put('/auth/profile')
  updateProfile(
    @GetUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserProfileDto
  ): Promise<UserSerializer> {
    return this.authService.update(user.id, updateUserDto);
  }

  @Get('/auth/activate-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  activateAccount(@Query('token') token: string): Promise<void> {
    return this.authService.activateAccount(token);
  }

  @Put('/auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @Put('/auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put('/auth/change-password')
  changePassword(
    @GetUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('/users')
  findAll(
    @Query() userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.authService.findAll(userSearchFilterDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('/users')
  create(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put('/users/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('/users/:id')
  findOne(@Param('id') id: string): Promise<UserSerializer> {
    return this.authService.findById(+id);
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() response: Response) {
    try {
      const cookiePayload =
        await this.authService.createAccessTokenFromRefreshToken(
          req.cookies['Refresh']
        );
      response.setHeader('Set-Cookie', cookiePayload);
      return response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (e) {
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('/logout')
  async logOut(@Req() req: Request, @Res() response: Response) {
    await this.authService.revokeRefreshToken(req.cookies['Refresh']);
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('/auth/token-info')
  getRefreshToken(@GetUser() user: UserEntity): Promise<Array<RefreshToken>> {
    return this.authService.activeRevokeTokenList(+user.id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  revokeToken(@Param('id') id: string, @GetUser() user: UserEntity) {
    return this.authService.revokeTokenById(+id, user.id);
  }
}
