import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Envs } from '../../common/envs/envs';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { DataResponse } from '../queue/dto/data-response.dto';
import { QueueService } from '../queue/queue.service';
import { SendTopicsEnum } from '../queue/type/send-topics.enum';
import { SendOnlineDto } from '../queue/dto/send-online.dto';
import { ClientSocket, CustomWebSocketClient } from './types/client-socket.type';
import { WsServer } from './raw/socket-server';
import { EventsEnum } from './types/event.enum';
import { TopicsEnum } from './types/topics.enum';

export let rooms: WsServer;

const changeRooms = (value: WsServer) => {
    rooms = value;
};

@ApiController()
@WebSocketGateway(Envs.main.socketIoPort, {
    cors: {
        origin: ['http://localhost:3006', 'http://localhost:4173', 'https://passimx.ru'], // Разрешаем запросы только с этих доменов
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly wsServer: WsServer,
        private readonly jwtService: JwtService,
        private readonly queueService: QueueService,
    ) {}

    async handleConnection(@ConnectedSocket() socket: ClientSocket, @Req() request: Request): Promise<void> {
        socket.client = new CustomWebSocketClient(this.wsServer);

        await socket.client.addToken(request, this.jwtService);
        socket.id = socket.client.id;
        if (!socket.client.sessionId) return socket.close();

        const connection = this.wsServer.connections.get(socket.client.id);
        if (connection) connection.close();

        this.wsServer.joinConnection(socket);
        socket.client.emit(EventsEnum.GET_SOCKET_ID, new DataResponse<string>(socket.id, true));
        socket.client.setPingTimeout(socket);

        changeRooms(this.wsServer);
    }

    handleDisconnect(@ConnectedSocket() socket: ClientSocket): void {
        this.wsServer.leaveConnection(socket);
        socket.close();
        changeRooms(this.wsServer);
        this.queueService.sendMessage(
            SendTopicsEnum.OFFLINE,
            new SendOnlineDto({
                userId: socket.client.userId,
                sessionId: socket.client.sessionId,
            }),
        );
    }

    @SubscribeMessage(TopicsEnum.PING)
    pong(@ConnectedSocket() socket: ClientSocket): void {
        socket.client.emit(EventsEnum.PONG);
        socket.client.setPingTimeout(socket);
    }
}
