import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../auth/entity/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { TwofaCodeDto } from './dto/twofa-code.dto';
import { TwoFaStatusUpdateDto } from './dto/twofa-status-update.dto';
import { TwofaService } from './twofa.service';

@Controller('twofa')
export class TwofaController {
  constructor(
    private readonly twofaService: TwofaService,
    private readonly usersService: AuthService
  ) {}

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() req: Request,
    @Res() response: Response,
    @GetUser() user: UserEntity,
    @Body() twofaCodeDto: TwofaCodeDto
  ) {
    const isCodeValid = this.twofaService.isTwoFACodeValid(
      twofaCodeDto.code,
      user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const accessToken = await this.usersService.generateAccessToken(user, true);
    const cookiePayload = this.usersService.buildResponsePayload(accessToken);
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Res() response: Response, @GetUser() user: UserEntity) {
    const { otpauthUrl } = await this.twofaService.generateTwoFASecret(user);
    return this.twofaService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async toggleTwoFa(
    @Body() twofaStatusUpdateDto: TwoFaStatusUpdateDto,
    @GetUser() user: UserEntity
  ) {
    return this.usersService.turnOnTwoFactorAuthentication(
      user.id,
      twofaStatusUpdateDto.isTwoFAEnabled
    );
  }
}
