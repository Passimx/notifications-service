import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { QueueModule } from './queue/queue.module';
import { CacheModule } from './caching/caching.module';

@Module({
    imports: [CacheModule, SocketModule, QueueModule],
})
export class AppModule {}
