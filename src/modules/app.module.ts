import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { QueueModule } from './queue/queue.module';

@Module({
    imports: [SocketModule, QueueModule],
})
export class AppModule {}
