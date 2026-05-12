import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import type { Response } from 'express';
import { jwtRefreshGuard, jwtAcessGuard } from './guard';
import { GetUser } from '../user/decorator';
import type { PayloadUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}

  // Sign in
  @Post('signin')
  async signin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authservice.signin(dto);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return 'login successful';
  }

  // Logout
  @UseGuards(jwtAcessGuard)
  @Post('logout')
  logout(
    @GetUser() user: PayloadUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');

    return this.authservice.logout(user);
  }

  // Refresh token
  @UseGuards(jwtRefreshGuard)
  @Post('refresh')
  async refreshToken(
    @GetUser() user: PayloadUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authservice.refresh(user);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return 'refresh successful';
  }
}
