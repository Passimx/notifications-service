import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import wsServer from '../socket/raw/socket-server';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        wsServer.setCacheService(this);
    }

    // Метод для установки значения в кеш
    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    // Метод для получения значения из кеша
    async get<T>(key: string): Promise<T | undefined> {
        return await this.cacheManager.get<T>(key);
    }

    // Метод для удаления значения из кеша
    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    // Метод для проверки наличия ключа в кеше
    async has(key: string): Promise<boolean> {
        const value = await this.cacheManager.get(key);
        return value !== undefined;
    }

    public async updateMaxUsersOnline(roomName: string, onlineUsers: number): Promise<void> {
        const cachedMaxUsersOnline = (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;
        // console.log(`Текущие максимальные пользователи онлайн для ${roomName}: ${cachedMaxUsersOnline}`);
        if (onlineUsers > cachedMaxUsersOnline) {
            await this.set(`maxUsersOnline:${roomName}`, onlineUsers);
            // console.log(`Обновлено максимальное количество пользователей онлайн для ${roomName}: ${onlineUsers}`);
        }
    }

    // Метод для получения максимального количества пользователей онлайн
    async getMaxUsersOnline(roomName: string): Promise<number> {
        return (await this.get<number>(`maxUsersOnline:${roomName}`)) || 0;
    }

    public async getCachedValue(key: string): Promise<any> {
        return await this.get(key);
    }
}
