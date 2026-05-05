import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, HttpStatus, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';


@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('google')
  async googleLogin(@Res() res: Response) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    return res.redirect(`${backendUrl}/oauth2/authorization/google`);
  }

  @Get('google/callback')
  async googleCallback(@Query('token') token: string, @Query('refreshToken') refreshToken: string, @Res() res: Response) {
    const result = await this.authService.handleGoogleCallback(token, refreshToken);

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 86400000,
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    return res.redirect(result.redirectUrl);
  }

  @Post('authenticate')
  async login(@Body() loginDto: any, @Res() res: Response) {
    const { sessionId, token, refreshToken, user } = await this.authService.authenticate(loginDto);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 86400000, // 1 day
      domain: process.env.COOKIE_DOMAIN || undefined,
    });


    return res.status(HttpStatus.OK).json({
      message: 'Login successful',
      result: { token, refreshToken, user },
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies['sessionId'];
    if (sessionId) {
      await this.authService.logout(sessionId);
    }
    res.clearCookie('sessionId');
    return res.status(HttpStatus.OK).json({ message: 'Logged out' });
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const sessionId = req.cookies['sessionId'];
    if (!sessionId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const session = await this.authService.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    return { result: session.user };
  }
}
