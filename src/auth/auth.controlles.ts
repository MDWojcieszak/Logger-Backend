import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto, ResetPasswordDto } from './dto';
import { Tokens } from './types';
import { GetCurrentUser, Public } from '../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RtGuard } from '../common/guards';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  signIn(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signIn(dto);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@GetCurrentUser('sub') userId: string) {
    return this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @GetCurrentUser('sub') userId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(userId, dto);
    return { message: 'Password reset successful' };
  }

  @Public()
  @ApiBearerAuth('JWT-refresh')
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refteshToken(
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refteshTokens(userId, refreshToken);
  }
}
