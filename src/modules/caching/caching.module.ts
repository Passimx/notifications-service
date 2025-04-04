import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheService } from './caching.service';

@Module({
    providers: [
        {
            provide: 'REDIS',
            useFactory: () => {
                return new Redis({
                    host: 'localhost', // Замените на ваш хост
                    port: 6379, // Замените на ваш порт
                });
            },
        },
        CacheService,
    ],
    exports: [CacheService],
})
export class CacheRedisModule {}
