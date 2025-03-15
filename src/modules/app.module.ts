import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { QueueModule } from './queue/queue.module';
import { ConnectionsModule } from './connections/connections.module';

@Module({
    imports: [SocketModule, QueueModule, ConnectionsModule],
})
export class AppModule {}
