import { Module } from '@nestjs/common';
import { Envs } from '../../common/envs/envs';
import { CacheModule } from '../caching/caching.module';
import { QueueModule } from '../queue/queue.module';
import { SocketGateway } from './socket.gateway';
import { WsServer } from './raw/socket-server';

@Module({
    imports: [CacheModule, QueueModule],
    providers: [SocketGateway, WsServer],
    controllers: Envs.swagger.isWriteConfig ? [] : [],
    exports: [WsServer],
})
export class SocketModule {}
