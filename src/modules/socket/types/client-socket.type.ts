import { FastifyRequest } from 'fastify';
import wsServer from '../raw/socket-server';
import { Envs } from '../../../common/envs/envs';

export class CustomWebSocketClient {
    public id!: string;

    public headers!: { [key: string]: string };

    public readonly rooms!: Set<string>;

    private pingTimeout: NodeJS.Timeout | null;

    constructor(request: FastifyRequest) {
        this.rooms = new Set<string>();
        this.id = request.headers['sec-websocket-key'] ?? 'unknown';
        this.headers = request.headers as { [key: string]: string };
    }

    public join(roomName: string): void {
        wsServer.join(this.id, roomName);
    }

    public leave(roomName: string): void {
        wsServer.leave(this.id, roomName);
    }

    public leaveAll(): void {
        this.rooms.forEach((roomName) => this.leave(roomName));
    }

    public setPingTimeout(socket: ClientSocket): void {
        this.clearPingTimeout();
        this.pingTimeout = setTimeout(() => {
            socket.close();
            wsServer.deleteConnection(socket);
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
