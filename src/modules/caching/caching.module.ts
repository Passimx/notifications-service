import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './caching.service';

@Global()
@Module({
    imports: [
        CacheModule.register({
            store: redisStore,
            url: 'redis://passimx-redis:6379',
            ttl: 60,
        }),
    ],
    exports: [CacheService],
    providers: [CacheService],
})
export class CacheRedisModule {}
