import { JwtService } from '@nestjs/jwt';
import { WsServer } from '../raw/socket-server';
import { Envs } from '../../../common/envs/envs';
import { CryptoUtils } from '../../../common/utils/crypto.utils';
import { logger } from '../../../common/logger/logger';
import { EventsEnum } from './event.enum';
import { TokenPayload } from './token-payload.type';

export class CustomWebSocketClient {
    public id?: string;
    public userId?: string;
    public sessionId?: string;
    public chatNames: Set<string>;

    private pingTimeout: NodeJS.Timeout | null;

    constructor(private readonly wsServer?: WsServer) {
        this.chatNames = new Set<string>();
        this.pingTimeout = null;
    }

    public async addToken(request: any, jwtService: JwtService) {
        const param = 'token=';
        const queryString = request.url as string;

        const paramsString = queryString.startsWith('/') ? queryString.substring(1) : queryString;
        const index = paramsString.indexOf(param);
        if (index === -1) return;

        const params = new URLSearchParams(paramsString.slice(index));
        const token = params.get('token');

        try {
            const payload = await jwtService.verifyAsync<TokenPayload>(token);
            this.userId = CryptoUtils.getHash(payload.rsaPublicKey);
            this.sessionId = payload.sessionId;
            this.id = `${payload.sessionId}${this.userId}`;
        } catch (e) {
            logger.error(e);
            return;
        }
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
}

export class CustomWebSocketClass {
    public id!: string;
    public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
