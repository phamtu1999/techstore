import { Controller, All, Req, Res, Logger, Inject, forwardRef } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ProxyService } from '../proxy.service';
import { AuthService } from '../../auth/auth.service';
@Controller('api/v1')

export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.path;
    
    // Skip specific BFF auth endpoints
    const bffAuthEndpoints = [
      '/api/v1/auth/authenticate',
      '/api/v1/auth/logout',
      '/api/v1/auth/profile'
    ];
    if (bffAuthEndpoints.some(endpoint => path.startsWith(endpoint))) {
      return;
    }


    const sessionId = req.cookies['sessionId'];
    const headers = { ...req.headers };
    
    if (sessionId) {
      const session = await this.authService.getSession(sessionId);
      if (session && session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
        this.logger.debug(`Attached JWT for session: ${sessionId}`);
      }
    }

    let response = await this.proxyService.forward(
      req.method,
      path,
      req.body,
      headers,
      req.query,
    );

    // Automatic Token Refresh: If 401 Unauthorized, try to refresh and retry once
    if (response.status === 401 && sessionId) {
      this.logger.log(`JWT expired for session ${sessionId}. Attempting refresh...`);
      try {
        const { token: newToken } = await this.authService.refreshToken(sessionId);
        headers['Authorization'] = `Bearer ${newToken}`;
        
        // Retry the request
        response = await this.proxyService.forward(
          req.method,
          path,
          req.body,
          headers,
          req.query,
        );
        this.logger.log(`Successfully refreshed token and retried request for session ${sessionId}`);
      } catch (refreshError) {
        this.logger.error(`Failed to refresh token for session ${sessionId}: ${refreshError.message}`);
        // If refresh fails, we return the original 401 or a new 401
      }
    }

    // Forward headers from backend (essential for file downloads)
    if (response.headers) {
      Object.keys(response.headers).forEach(key => {
        // Skip some headers that might cause issues
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key]);
        }
      });
    }

    const contentType = response.headers?.['content-type'] || '';
    const isBinary = contentType.includes('spreadsheetml.sheet') || 
                     contentType.includes('application/octet-stream') ||
                     contentType.includes('application/x-gzip') ||
                     contentType.includes('application/gzip') ||
                     path.includes('/export') ||
                     path.includes('/backups/download');

    if (isBinary) {
      this.logger.log(`[Proxy] Sending binary response for: ${path}`);
      const data = response.data instanceof ArrayBuffer ? Buffer.from(response.data) : response.data;
      return res.status(response.status).send(data);
    }

    return res.status(response.status).json(response.data);
  }
}
