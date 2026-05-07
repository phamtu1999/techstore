import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly backendUrl: string;
  private readonly pendingRequests = new Map<string, Promise<{ status: number; data: any; headers?: any }>>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    const rawUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:8081';
    const normalizedUrl = rawUrl.trim().replace(/\/+$/, '');
    this.backendUrl = (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://'))
      ? normalizedUrl
      : (normalizedUrl.includes('localhost') || normalizedUrl.includes(':') || !normalizedUrl.includes('.') 
          ? `http://${normalizedUrl}` 
          : `https://${normalizedUrl}`);
    this.logger.log(`ProxyService initialized with backendUrl: ${this.backendUrl}`);
  }

  async forward(
    method: string,
    path: string,
    data?: any,
    headers?: any,
    params?: any,
    sessionId?: string,
  ): Promise<{ status: number; data: any; headers?: any }> {
    const url = `${this.backendUrl}${path}`;

    // Clean sensitive or conflicting headers
    const cleanedHeaders = { ...headers };
    delete cleanedHeaders['host'];
    delete cleanedHeaders['cookie']; 
    
    // Chỉ xóa content-length nếu không phải upload file (Multipart)
    if (!cleanedHeaders['content-type']?.includes('multipart/form-data')) {
      delete cleanedHeaders['content-length'];
    }
    
    delete cleanedHeaders['origin']; // Fix "Invalid CORS request" 403 error
    delete cleanedHeaders['referer'];

    // 1. Check for sessionId in cookies to attach Authorization header
    if (sessionId) {
      this.logger.debug(`[Proxy] SessionId found in request: ${sessionId}`);
      const session = await this.authService.getSession(sessionId);
      if (session && session.token) {
        this.logger.debug(`[Proxy] Session found in Redis. Attaching Authorization header.`);
        cleanedHeaders['Authorization'] = `Bearer ${session.token}`;
      } else {
        this.logger.warn(`[Proxy] SessionId ${sessionId} provided but session not found or token missing in Redis.`);
      }
    }

    const isBinaryRequest = path.includes('/export') || path.includes('/backups/download');
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: cleanedHeaders,
      params,
      validateStatus: () => true,
      timeout: 60000,
      responseType: isBinaryRequest ? 'arraybuffer' : 'json',
    };

    // 2. Cache logic (GET only, exclude admin)
    let cacheKey: string | null = null;
    if (method.toUpperCase() === 'GET' && !path.includes('/admin/') && !isBinaryRequest) {
      const paramsString = JSON.stringify(params || {});
      const authHeader = cleanedHeaders['Authorization'] || 'anonymous';
      cacheKey = `proxy_cache:${path}:${paramsString}:${authHeader}`;
      
      try {
        const cachedResponse = await this.cacheManager.get(cacheKey);
        if (cachedResponse) {
          this.logger.debug(`[Proxy] Serving cached response for: ${path}`);
          return cachedResponse as { status: number; data: any; headers?: any };
        }
      } catch (cacheError) {
        this.logger.warn(`[Proxy] Cache access error: ${cacheError.message}. Proceeding without cache.`);
      }
    }

    if (method.toUpperCase() === 'GET') {
      const pendingKey = `pending:${method}:${url}:${JSON.stringify(params)}:${cleanedHeaders['Authorization'] || 'anonymous'}`;
      const existingRequest = this.pendingRequests.get(pendingKey);
      if (existingRequest) {
        this.logger.debug(`[Proxy] Collapsing duplicate request for: ${path}`);
        return existingRequest;
      }

      const requestPromise = (async () => {
        try {
          this.logger.log(`[Proxy] Forwarding ${method} ${path} to ${url}`);
          const response = await firstValueFrom(this.httpService.request(config));
          
          const result = {
            status: response.status,
            data: response.data,
            headers: response.headers,
          };

          if (cacheKey && response.status >= 200 && response.status < 300 && !isBinaryRequest) {
            try {
              await this.cacheManager.set(cacheKey, result, 60000);
            } catch (cacheError) {
              this.logger.warn(`[Proxy] Cache set error: ${cacheError.message}`);
            }
          }

          return result;
        } finally {
          this.pendingRequests.delete(pendingKey);
        }
      })();

      this.pendingRequests.set(pendingKey, requestPromise);
      return requestPromise;
    }

    try {
      this.logger.log(`[Proxy] Forwarding ${method} ${path} -> ${url}`);
      const response = await firstValueFrom(this.httpService.request(config));
      this.logger.log(`[Proxy] Backend responded: ${response.status} for ${path}`);

      // Nếu là lệnh thay đổi dữ liệu (POST, PUT, DELETE, PATCH) thành công, xóa sạch cache
      const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
      if (isMutation && response.status >= 200 && response.status < 300) {
        this.logger.log(`[Proxy] Mutation detected on ${path}. Invalidating proxy cache...`);
        try {
          const manager = this.cacheManager as any;
          const store = manager.store;
          
          // Nếu dùng Redis (ioredis), ta có thể quét và xóa theo pattern
          if (store && store.client && typeof store.client.keys === 'function') {
            const client = store.client;
            const keys = await client.keys('proxy:cache:*');
            if (keys.length > 0) {
              await client.del(...keys);
              this.logger.log(`[Proxy] Deleted ${keys.length} cached proxy keys`);
            }
          } else {
            // Fallback cho in-memory cache
            if (typeof manager.reset === 'function') {
              await manager.reset();
            } else if (typeof manager.clear === 'function') {
              await manager.clear();
            }
          }
        } catch (e) {
          this.logger.error(`[Proxy] Failed to invalidate cache: ${e.message}`);
        }
      }

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error) {
      this.logger.error(`[Proxy] Critical error forwarding to ${url}: ${error.message}`);
      if (error.response) {
        this.logger.error(`[Proxy] Backend error response: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}
