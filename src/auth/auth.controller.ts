import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserSerializer } from './serializer/user.serializer';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

@ApiTags('user')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  register(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<void> {
    return this.authService.addUser(createUserDto);
  }

  @Post('/login')
  @HttpCode(200)
  login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  @UseGuards(AuthGuard())
  @Get('/profile')
  @ApiBearerAuth()
  profile(@GetUser() user: UserEntity): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(AuthGuard())
  @Put('/profile')
  @ApiBearerAuth()
  update(
    @GetUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(user, updateUserDto);
  }

  @Put('/forgot-password')
  forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @Put('/reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
