import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { QueueModule } from './queue/queue.module';
import { CacheRedisModule } from './caching/caching.module';

@Module({
    imports: [SocketModule, QueueModule, CacheRedisModule],
})
export class AppModule {}
