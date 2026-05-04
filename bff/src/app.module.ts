import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { redisStore } from 'cache-manager-ioredis-yet';
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
          const commonOptions = {
            ...redisOptions,
            ttl: 3600000,
            // ⚠️ Quan trọng: Bắt lỗi của Redis client để không làm sập tiến trình Node.js
            onClientCreated: (client: any) => {
              client.on('error', (err: any) => {
                console.warn('[Redis] Connection Error:', err.message);
              });
            }
          };

          if (url) {
            console.log(`[Redis] Connecting to BFF Cache using URL...`);
            return {
              store: await redisStore({
                url: url,
                ...commonOptions,
              })
            };
          }

          if (host && host !== 'localhost' && host !== '127.0.0.1') {
            console.log(`[Redis] Connecting BFF Cache via host ${host}:${port}...`);
            return {
              store: await redisStore({
                host,
                port: Number(port),
                password,
                ...commonOptions,
              })
            };
          }
        } catch (e) {
          console.error('[Redis] Failed to initialize Redis store:', e.message);
        }

        console.warn(
          '[Redis] Falling back to in-memory cache. Sessions and cache will reset on restart.',
        );
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
