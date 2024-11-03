import { Module } from '@nestjs/common';
import { Envs } from '../../common/envs/envs';
import { SocketGateway } from './socket.gateway';

@Module({
    providers: [SocketGateway],
    controllers: Envs.swagger.isWriteConfig ? [SocketGateway] : [],
})
export class SocketModule {}
