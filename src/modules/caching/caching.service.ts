import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { logger } from '../../common/logger/logger';

@Injectable()
export class CacheService {
    constructor(@Inject('REDIS') private redis: Redis) {}

    // Метод для установки значения в кеш
    async set(key: string, value: number): Promise<void> {
        const stringValue = JSON.stringify(value);
        await this.redis.set(key, stringValue);
    }

    // Метод для получения значения из кеша
    async get<T>(key: string): Promise<T | undefined> {
        try {
            const data = await this.redis.get(key);
            return data ? (JSON.parse(data) as T) : undefined;
        } catch (e) {
            logger.error(e);
            return undefined;
        }
    }

    public async updateMaxUsersOnline(roomName: string, onlineUsers: number): Promise<void> {
        const cachedMaxUsersOnline = (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;

        if (onlineUsers > cachedMaxUsersOnline) {
            try {
                await this.set(`maxUsersOnline:${roomName}`, onlineUsers);
            } catch (e) {
                logger.error(e);
            }
        }
    }

    // Метод для получения максимального количества пользователей онлайн
    async getMaxUsersOnline(roomName: string): Promise<number> {
        return (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;
    }
}
