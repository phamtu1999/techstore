import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ProxyService } from '../proxy/proxy.service';
import { randomUUID } from 'node:crypto';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => ProxyService))
    private readonly proxyService: ProxyService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async authenticate(loginDto: any) {
    console.log(`[Auth] Step 1: Forwarding login request to Backend...`);
    const response = await this.proxyService.forward(
      'POST',
      '/api/v1/auth/authenticate',
      loginDto,
    );
    console.log(`[Auth] Step 2: Backend responded with status: ${response.status}`);

    if (response.status !== 200) {
      console.log(`[Auth] Login failed at Backend: ${JSON.stringify(response.data)}`);
      throw new UnauthorizedException(response.data?.message || 'Authentication failed');
    }

    const { token, refreshToken, ...user } = response.data.result;
    const sessionId = randomUUID();
    console.log(`[Auth] Step 3: Successfully authenticated. Creating session: ${sessionId}`);

    // Store JWT, Refresh Token and user info in Redis (expires in 7 days to match refresh token)
    console.log(`[Auth] Step 4: Storing session in Redis...`);
    try {
      await this.cacheManager.set(
        `session:${sessionId}`,
        { token, refreshToken, user },
        604800000, // 7 days in ms
      );
      console.log(`[Auth] Step 5: Session stored successfully!`);
    } catch (cacheError) {
      console.error(`[Auth] Step 5: Failed to store session in Redis: ${cacheError.message}`);
      // Note: We continue here, but the user will likely be unauthorized on the next request
      // unless the session was somehow saved or Redis recovers immediately.
    }

    // Return user with tokens for frontend Redux/LocalStorage compatibility
    return { sessionId, token, refreshToken, user };
  }

  async logout(sessionId: string) {
    try {
      await this.cacheManager.del(`session:${sessionId}`);
    } catch (e) {
      console.error(`[Auth] Logout Redis error: ${e.message}`);
    }
  }

  async handleGoogleCallback(token: string, refreshToken: string) {
    if (!token || !refreshToken) {
      throw new UnauthorizedException('Missing Google auth tokens');
    }

    const sessionId = randomUUID();
    const payload = this.decodeJwtPayload(token);
    const user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.name,
      role: payload.role,
      token,
      refreshToken,
    };

    await this.cacheManager.set(
      `session:${sessionId}`,
      { token, refreshToken, user },
      604800000,
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/login?googleLogin=success`;

    return { sessionId, token, refreshToken, user, redirectUrl };
  }

  async getSession(sessionId: string) {
    try {
      return await this.cacheManager.get<any>(`session:${sessionId}`);
    } catch (e) {
      console.error(`[Auth] Get session Redis error: ${e.message}`);
      return null;
    }
  }

  async refreshToken(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session || !session.refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const response = await this.proxyService.forward(
      'POST',
      '/api/v1/auth/refresh',
      { refreshToken: session.refreshToken },
    );

    if (response.status !== 200) {
      await this.logout(sessionId);
      throw new UnauthorizedException('Refresh failed');
    }

    const { token, refreshToken: newRefreshToken } = response.data.result;

    // Update session with new tokens
    await this.cacheManager.set(
      `session:${sessionId}`,
      { ...session, token, refreshToken: newRefreshToken || session.refreshToken },
      604800000,
    );

    return { token };
  }

  private decodeJwtPayload(token: string): any {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      throw new UnauthorizedException('Invalid token format');
    }
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  }
}
