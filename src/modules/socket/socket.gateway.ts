import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { FastifyRequest } from 'fastify';
import { Req } from '@nestjs/common';
import { Envs } from '../../common/envs/envs';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { DataResponse } from '../queue/dto/data-response.dto';
import { ClientSocket, CustomWebSocketClient } from './types/client-socket.type';
import wsServer from './raw/socket-server';
import { EventsEnum } from './types/event.enum';

@ApiController()
@WebSocketGateway(Envs.main.socketIoPort, {
    cors: {
        origin: ['https://tons-chat.ru', 'http://localhost:3006'], // Разрешаем запросы только с этих доменов
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true, // Разрешаем использование кук и токенов
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    handleConnection(@ConnectedSocket() socket: ClientSocket, @Req() request: FastifyRequest): void {
        socket.client = new CustomWebSocketClient(request);
        socket.id = socket.client.id;
        wsServer.addConnection(socket);
        wsServer.to(socket.id).emit(EventsEnum.GET_SOCKET_ID, new DataResponse<string>(socket.id, true));
    }

    handleDisconnect(@ConnectedSocket() socket: ClientSocket): void {
        wsServer.deleteConnection(socket);
        socket.close();
    }

    @SubscribeMessage(EventsEnum.PING)
    handPong(@ConnectedSocket() socket: ClientSocket): void {
        wsServer.to(socket.id).emit(EventsEnum.PONG, new DataResponse('ok'));
        socket.client.setPingTimeout(socket);
    }
}
