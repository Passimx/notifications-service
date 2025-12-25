import { randomUUID } from 'crypto';
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { Req } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Envs } from '../../common/envs/envs';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { DataResponse } from '../queue/dto/data-response.dto';
import { ClientSocket, CustomWebSocketClient } from './types/client-socket.type';
import { WsServer } from './raw/socket-server';
import { EventsEnum } from './types/event.enum';

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
    constructor(private readonly wsServer: WsServer) {}

    async handleConnection(@ConnectedSocket() socket: ClientSocket, @Req() request: Request): Promise<void> {
        socket.client = new CustomWebSocketClient(request, this.wsServer);
        socket.id = socket.client.id;
        socket.client.setPingTimeout(socket);
        const publicKeyString = socket.client.publicKeyString;
        if (!publicKeyString) socket.close();

        socket.client.randomUUID = randomUUID();

        const publicKey = await CryptoUtils.importRSAKey(publicKeyString, ['encrypt']);
        const data = await CryptoUtils.encryptByRSAKey(publicKey, socket.client.randomUUID);
        this.wsServer.joinConnection(socket);

        socket.client.emit(EventsEnum.VERIFY, data);
        changeRooms(this.wsServer);
    }

    handleDisconnect(@ConnectedSocket() socket: ClientSocket): void {
        this.wsServer.leaveConnection(socket);
        socket.close();
        changeRooms(this.wsServer);
    }

    @SubscribeMessage(EventsEnum.PING)
    pong(@ConnectedSocket() socket: ClientSocket): void {
        socket.client.emit(EventsEnum.PONG);
        socket.client.setPingTimeout(socket);
    }

    @SubscribeMessage(EventsEnum.VERIFY)
    verify(@ConnectedSocket() socket: ClientSocket, @Payload() payload): void {
        if (socket.client.randomUUID !== payload) return;
        this.wsServer.joinUserRoom(socket);
        socket.client.emit(EventsEnum.GET_SOCKET_ID, new DataResponse<string>(socket.id, true));
        changeRooms(this.wsServer);
    }
}
