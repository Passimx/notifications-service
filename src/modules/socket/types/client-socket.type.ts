import { randomUUID } from 'crypto';
import { WsServer } from '../raw/socket-server';
import { Envs } from '../../../common/envs/envs';
import { CryptoUtils } from '../../../common/utils/crypto.utils';
import { EventsEnum } from './event.enum';

export class CustomWebSocketClient {
    public id?: string;
    public userId: string;
    public headers: { [key: string]: string };
    public publicKeyString?: string;
    public randomUUID?: string;

    private pingTimeout: NodeJS.Timeout | null;

    constructor(
        request: any,
        private readonly wsServer?: WsServer,
    ) {
        const headers = request.headers as { [key: string]: string };

        const param = 'publicKey=';
        const queryString = request.url as string;

        const paramsString = queryString.startsWith('/') ? queryString.substring(1) : queryString;
        const index = paramsString.indexOf(param);
        if (index === -1) return;

        const params = new URLSearchParams(paramsString.slice(index));
        const publicKeyString = params.get('publicKey');
        if (!publicKeyString?.length) return;

        this.id = this.setSocketId();
        this.userId = CryptoUtils.getHash(publicKeyString);
        this.headers = headers;
        this.pingTimeout = null;
        this.publicKeyString = publicKeyString;
    }

    public emit(event: EventsEnum, data?: unknown) {
        this.wsServer.toConnection(this.id).emit(event, data);
    }

    public setPingTimeout(socket: ClientSocket): void {
        this.clearPingTimeout();
        this.pingTimeout = setTimeout(() => {
            socket.close();
            this.wsServer.leaveConnection(socket);
        }, Envs.main.pingTime);
    }

    public clearPingTimeout(): void {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout);
            this.pingTimeout = null;
        }
    }

    private setSocketId(): string {
        const socketId = randomUUID();
        if (this.wsServer.connections.get(socketId)) return this.setSocketId();

        return socketId;
    }
}

export class CustomWebSocketClass {
    public id!: string;

    public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
