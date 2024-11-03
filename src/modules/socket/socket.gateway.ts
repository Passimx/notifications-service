import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { FastifyRequest } from 'fastify';
import { Req } from '@nestjs/common';
import { Envs } from '../../common/envs/envs';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { ClientSocket, CustomWebSocketClient } from './types/client-socket.type';
import wsServer from './raw/socket-server';

@ApiController()
@WebSocketGateway(Envs.main.socketIoPort)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    handleConnection(@ConnectedSocket() socket: ClientSocket, @Req() request: FastifyRequest): void {
        socket.client = new CustomWebSocketClient(request);
        socket.id = socket.client.id;
        wsServer.addConnection(socket);
    }

    handleDisconnect(@ConnectedSocket() socket: ClientSocket): void {
        socket.close();
        wsServer.deleteConnection(socket);
    }
}
