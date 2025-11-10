import { createHmac } from 'crypto';
import { WsServer } from '../raw/socket-server';
import { Envs } from '../../../common/envs/envs';

export class CustomWebSocketClient {
    public id?: string;
    public headers: { [key: string]: string };
    public rooms: Set<string>;
    public publicKeyString?: string;
    public randomUUID?: string;

    private pingTimeout: NodeJS.Timeout | null;

    constructor(
        request: any,
        private readonly wsServer?: WsServer,
    ) {
        this.rooms = new Set<string>();
        const headers = request.headers as { [key: string]: string };

        const param = 'publicKey=';
        const queryString = request.url as string;

        const paramsString = queryString.startsWith('/') ? queryString.substring(1) : queryString;
        const index = paramsString.indexOf(param);
        if (index === -1) return;

        const params = new URLSearchParams(paramsString.slice(index));
        const publicKeyString = params.get('publicKey');
        if (!publicKeyString?.length) return;

        this.id = createHmac('sha256', Envs.main.socketIdSecret).update(publicKeyString).digest('hex');
        this.headers = headers;
        this.pingTimeout = null;
        this.publicKeyString = publicKeyString;
    }

    public join(roomName: string): void {
        this.wsServer.join(this.id, roomName);
    }

    public leave(roomName: string): void {
        this.wsServer.leave(this.id, roomName);
    }

    public leaveAll(): void {
        this.rooms.forEach((roomName) => this.leave(roomName));
    }

    public setPingTimeout(socket: ClientSocket): void {
        this.clearPingTimeout();
        this.pingTimeout = setTimeout(() => {
            socket.close();
            this.wsServer.deleteConnection(socket);
        }, Envs.main.pingTime);
    }

    public clearPingTimeout(): void {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout);
            this.pingTimeout = null;
        }
    }
}

export class CustomWebSocketClass {
    public id!: string;

    public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
