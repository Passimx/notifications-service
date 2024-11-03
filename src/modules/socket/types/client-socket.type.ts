import { FastifyRequest } from 'fastify';
import wsServer from '../raw/socket-server';

export class CustomWebSocketClient {
    public id!: string;

    public headers!: { [key: string]: string };

    public readonly rooms!: Set<string>;

    constructor(request: FastifyRequest) {
        this.rooms = new Set<string>();
        this.id = request.headers['sec-websocket-key'] ?? 'unknown';
        this.headers = request.headers as { [key: string]: string };
    }

    public join(roomName: string): void {
        this.rooms.add(roomName);
        wsServer.join(this.id, roomName);
    }

    public leave(roomName: string): void {
        this.rooms.delete(roomName);
        wsServer.leave(this.id, roomName);
    }

    public leaveAll(): void {
        this.rooms.forEach((roomName) => this.leave(roomName));
    }
}

export class CustomWebSocketClass {
    public id!: string;

    public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
