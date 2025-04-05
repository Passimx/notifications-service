import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Envs } from '../../common/envs/envs';
import { CacheService } from './caching.service';

@Module({
    providers: [
        {
            provide: 'REDIS',
            useFactory: () => {
                return new Redis({
                    host: Envs.redis.host,
                    port: Envs.redis.port,
                });
            },
        },
        CacheService,
    ],
    exports: [CacheService],
})
export class CacheModule {}
