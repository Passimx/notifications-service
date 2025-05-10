import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

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
        const data = await this.redis.get(key);
        return data ? (JSON.parse(data) as T) : undefined;
    }

    // Метод для удаления значения из кеша
    del(key: string): Promise<number> {
        return this.redis.del(key);
    }

    // Метод для проверки наличия ключа в кеше
    async has(key: string): Promise<boolean> {
        const value = await this.redis.get(key);
        return !!value;
    }

    public async updateMaxUsersOnline(roomName: string, onlineUsers: number): Promise<void> {
        const cachedMaxUsersOnline = (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;

        if (onlineUsers > cachedMaxUsersOnline) {
            await this.set(`maxUsersOnline:${roomName}`, onlineUsers);
        }
    }

    // Метод для получения максимального количества пользователей онлайн
    async getMaxUsersOnline(roomName: string): Promise<number> {
        return (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;
    }
}
