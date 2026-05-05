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
        const redisUrl = configService.get<string>('REDIS_URL') || configService.get<string>('REDIS_URI');
        const redisOptions = {
          enableOfflineQueue: false,
          connectTimeout: 5000,
          maxRetriesPerRequest: 0,
          retryStrategy: (times: number) => {
            if (times > 3) return null; 
            return Math.min(times * 200, 1000);
          },
        };

        if (!redisUrl) {
          console.warn('[Redis] REDIS_URL/REDIS_URI is missing. Falling back to in-memory cache.');
          return { ttl: 3600000 };
        }

        try {
          console.log('[Redis] Re-enabling Redis from REDIS_URL...');

          const client = new Redis(redisUrl, {
            ...redisOptions,
          });

          client.on('error', (err: any) => {
            console.warn('[Redis] Handled Error:', err.message);
          });

          const store = await redisStore({
            redisInstance: client,
            ttl: 3600000,
          });

          return { store };
        } catch (e: any) {
          console.error('[Redis] Re-enable failed, using In-memory:', e.message);
          return { ttl: 3600000 };
        }
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
