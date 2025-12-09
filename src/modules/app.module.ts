import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { QueueModule } from './queue/queue.module';
import { CacheModule } from './caching/caching.module';
import { HttpModule } from './http/http.module';

@Module({
    imports: [CacheModule, SocketModule, QueueModule, HttpModule],
})
export class AppModule {}
