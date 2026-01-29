import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Envs } from '../../common/envs/envs';
import { CacheModule } from '../caching/caching.module';
import { QueueModule } from '../queue/queue.module';
import { SocketGateway } from './socket.gateway';
import { WsServer } from './raw/socket-server';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: Envs.main.appSalt,
        }),
        forwardRef(() => QueueModule),
        forwardRef(() => CacheModule),
    ],
    providers: [WsServer, SocketGateway],
    exports: [WsServer],
    controllers: Envs.swagger.isWriteConfig ? [] : [],
})
export class SocketModule {}
