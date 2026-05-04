import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { redisStore } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('REDIS_URL') || configService.get('REDIS_URI');
        const host = configService.get('REDISHOST') || configService.get('REDIS_HOST') || 'localhost';
        const port = configService.get('REDISPORT') || configService.get('REDIS_PORT') || 6379;
        const password = configService.get('REDISPASSWORD') || configService.get('REDIS_PASSWORD');
        
        const redisOptions = {
          enableOfflineQueue: false,
          connectTimeout: 5000, // Giảm timeout xuống để fail nhanh hơn
          maxRetriesPerRequest: 0,
          retryStrategy: (times: number) => {
            // Chỉ retry tối đa 3 lần khi khởi động để tránh treo app
            if (times > 3) return null; 
            return Math.min(times * 200, 1000);
          },
        };
        
        try {
          const redisConfig: any = url ? { url } : { host, port: Number(port), password };
          console.log(`[Redis] Manually creating client for: ${host}:${port}...`);
          
          const client = new Redis({
            ...redisConfig,
            ...redisOptions,
          });

          // Bắt lỗi ngay lập tức trên client
          client.on('error', (err: any) => {
            console.warn('[Redis] Connection Error (Handled):', err.message);
          });

          const store = await redisStore({
            redisInstance: client,
            ttl: 3600000,
          });

          return { store };
        } catch (e) {
          console.error('[Redis] Manual initialization failed:', e.message);
        }

        return {
          ttl: 3600000,
        };
      },
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 5000,
    }]),
    AuthModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
