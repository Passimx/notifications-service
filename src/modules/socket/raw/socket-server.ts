import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ClientSocket, CustomWebSocketClient } from '../types/client-socket.type';
import { DataResponse } from '../../queue/dto/data-response.dto';
import { EventsEnum } from '../types/event.enum';
import { chatOnline } from '../types/chat-online.type';
import { CacheService } from '../../caching/caching.service';
import { ChatMaxUsersOnline } from '../types/chat-max-users-online.type';
import { QueueService } from '../../queue/queue.service';
import { TopicsEnum } from '../../queue/type/topics.enum';
import { WsInstance } from './ws-instance';

@Injectable()
export class WsServer {
    public readonly rooms: Map<string, Set<ClientSocket>> = new Map<string, Set<ClientSocket>>();
    private readonly maxUsersOnline: Map<string, number> = new Map<string, number>();

    constructor(
        private readonly cacheService: CacheService,
        private readonly queueService: QueueService,
    ) {}

    public leave(clientId: string, ...roomNames: string[]): boolean {
        const [client]: ClientSocket[] = Array.from(this.rooms.get(clientId) ?? []);

        const rooms: chatOnline[] = [];
        if (!client) return false;

        roomNames.forEach((name) => {
            client.client.rooms.delete(name);

            const correctRoom = this.rooms.get(name);
            if (!correctRoom) return;

            correctRoom.delete(client);
            if (!correctRoom.size) return this.rooms.delete(name);

            const onlineUsers = this.rooms.get(name).size;
            const roundNumbers = this.getNumbersString(onlineUsers);

            rooms.push({ id: name, online: roundNumbers });
        });

        rooms.forEach(({ id, online }) => {
            const onlineBefore = this.getNumbersString(this.rooms.get(id).size + 1);
            if (online !== onlineBefore) this.online({ id, online });
        });

        return true;
    }

    public async join(clientId: string, ...roomNames: string[]): Promise<boolean> {
        const [client]: ClientSocket[] = Array.from(this.rooms.get(clientId) ?? []);
        if (!client) return false;

        const rooms: chatOnline[] = [];

        for (const name of roomNames) {
            client.client.rooms.add(name);
            const correctRoom = this.rooms.get(name);

            if (!correctRoom) {
                const newRoom = new Set<ClientSocket>();
                newRoom.add(client);
                this.rooms.set(name, newRoom);
                const redisMaxUsersOnline = await this.cacheService.getMaxUsersOnline(name);
                this.maxUsersOnline.set(name, redisMaxUsersOnline);
            } else {
                correctRoom.add(client);
            }
            const onlineUsers = this.rooms.get(name).size;
            const roundNumbers = this.getNumbersString(onlineUsers);
            const localMaxUsers = this.maxUsersOnline.get(name) || 0;

            rooms.push({ id: name, online: roundNumbers });

            if (onlineUsers > localMaxUsers) {
                await this.cacheService.updateMaxUsersOnline(name, onlineUsers);
                this.maxUsersOnline.set(name, onlineUsers);
                this.sendMaxUsersToKafka(name, onlineUsers);
                this.to(name).emit(
                    EventsEnum.MAX_USERS_ONLINE,
                    new DataResponse<ChatMaxUsersOnline[]>([
                        {
                            id: name,
                            maxUsersOnline: String(onlineUsers),
                        },
                    ]),
                );
            }
        }

        // новый пользователь сразу получает актуальную информацию
        this.to(clientId).emit(EventsEnum.CHAT_COUNT_ONLINE, new DataResponse<chatOnline[]>(rooms));

        rooms.forEach(({ id, online }) => {
            const onlineBefore = this.getNumbersString(this.rooms.get(id).size - 1);
            if (online !== onlineBefore) this.online({ id, online }, clientId);
        });

        return true;
    }

    private sendMaxUsersToKafka(roomName: string, onlineUsers: number) {
        const message = { roomName, onlineUsers };
        const response = new DataResponse(message);
        this.queueService.sendMessage(TopicsEnum.ONLINE, response);
    }

    private getNumbersString(number: number): string {
        if (number < 1000) {
            return number.toString();
        } else if (number < 1000000) {
            return (number / 1000).toString() + 'К';
        } else {
            return (number / 1000000).toString() + 'M';
        }
    }

    public online(room: chatOnline, clientId?: string): void {
        this.to(room.id)
            .except(clientId)
            .emit(EventsEnum.CHAT_COUNT_ONLINE, new DataResponse<chatOnline[]>([room]));
    }

    public to(roomName: string): WsInstance {
        const room = new Set(this.rooms.get(roomName));
        const selectedClients = new Set<ClientSocket>();

        if (room) room.forEach((client) => selectedClients.add(client));
        const rooms = new Map<string, Set<ClientSocket>>(this.rooms);

        return new WsInstance(rooms, selectedClients);
    }

    public addConnection(client: ClientSocket, request: FastifyRequest): boolean {
        client.client = new CustomWebSocketClient(request);
        client.id = client.client.id;
        if (!client.id) return false;

        client.id = client.client.id;
        client.client.setWsServer(this);
        const userRoom = new Set<ClientSocket>();
        userRoom.add(client);
        this.rooms.set(client.id, userRoom);
        client.client.setPingTimeout(client);
        return true;
    }

    public deleteConnection(client: ClientSocket): boolean {
        if (!client.id) return false;
        client.client.clearPingTimeout();
        client.client.leaveAll();
        return this.rooms.delete(client.id);
    }
}
