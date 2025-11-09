import { Injectable } from '@nestjs/common';
import { ClientSocket } from '../types/client-socket.type';
import { DataResponse } from '../../queue/dto/data-response.dto';
import { chatOnline } from '../types/chat-online.type';
import { EventsEnum } from '../types/event.enum';
import { QueueService } from '../../queue/queue.service';
import { TopicsEnum } from '../../queue/type/topics.enum';
import { CacheService } from '../../caching/caching.service';
import { ChatMaxUsersOnline } from '../types/chat-max-users-online.type';

@Injectable()
export class WsServer {
    public rooms: Map<string, Set<ClientSocket>> = new Map();
    public selectedClients: Set<ClientSocket> = new Set();
    private readonly maxUsersOnline: Map<string, number> = new Map();
    public readonly systemChats = new Set<string>();

    constructor(
        private readonly queueService: QueueService,
        private readonly cacheService: CacheService,
    ) {}

    private createNewInstance(rooms: Map<string, Set<ClientSocket>>, selectedClients: Set<ClientSocket>): WsServer {
        const instance = new WsServer(this.queueService, this.cacheService);
        instance.rooms = rooms;
        instance.selectedClients = selectedClients;
        return instance;
    }

    public putSystemChat() {
        this.queueService.sendMessage(TopicsEnum.PUT_SYSTEM_CHATS, new DataResponse(''));
    }

    public setSystemChats(chatId: string[]) {
        chatId.forEach((chatId) => {
            this.systemChats.add(chatId);
        });
    }

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

            if (onlineUsers > localMaxUsers) {
                this.sendMaxUsersToKafka(name, onlineUsers);
                await this.cacheService.updateMaxUsersOnline(name, onlineUsers);
                this.maxUsersOnline.set(name, onlineUsers);
                if (!this.systemChats.has(name)) {
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
            if (!this.systemChats.has(name)) rooms.push({ id: name, online: roundNumbers });
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
        if (!this.systemChats.has(room.id)) {
            this.to(room.id)
                .except(clientId)
                .emit(EventsEnum.CHAT_COUNT_ONLINE, new DataResponse<chatOnline[]>([room]));
        }
    }

    public to(roomName: string): WsServer {
        const room = new Set(this.rooms.get(roomName));
        const selectedClients = new Set<ClientSocket>(this.selectedClients);

        if (room) room.forEach((client) => selectedClients.add(client));
        const rooms = new Map<string, Set<ClientSocket>>(this.rooms);

        return this.createNewInstance(rooms, selectedClients);
    }

    public except(roomName: string): WsServer {
        const rooms = new Map(this.rooms);
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const exceptedRoom = this.rooms.get(roomName);

        if (exceptedRoom) exceptedRoom.forEach((client) => selectedClients.delete(client));

        return this.createNewInstance(rooms, selectedClients);
    }

    public intersect(...intersectRooms: string[]): WsServer {
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const rooms = new Map(this.rooms);

        const clientRoomsCount = new Map<ClientSocket, number>();

        intersectRooms.forEach((roomName) => {
            const clients = rooms.get(roomName);

            if (clients) {
                clients.forEach((client) => {
                    const correctClientRoomsCount = clientRoomsCount.get(client);

                    if (correctClientRoomsCount) clientRoomsCount.set(client, correctClientRoomsCount + 1);
                    else clientRoomsCount.set(client, 1);
                });
            }
        });

        clientRoomsCount.forEach((count, client) => {
            if (count === intersectRooms.length) selectedClients.add(client);
        });

        return this.createNewInstance(rooms, selectedClients);
    }

    public emitAll(event: string, data: object | string) {
        const clientsRoom = new Set<ClientSocket>();
        this.rooms.forEach((room) => room.forEach((client) => clientsRoom.add(client)));

        clientsRoom.forEach((client) => client.send(JSON.stringify({ event, data })));
    }

    public emit(event: EventsEnum, data: DataResponse<unknown>): void {
        if (!this.selectedClients.size) return;
        this.selectedClients.forEach((client) => client.send(JSON.stringify({ event, data })));
    }

    public addConnection(client: ClientSocket): boolean {
        if (!client.id) return false;

        const userRoom = new Set<ClientSocket>();
        userRoom.add(client);
        this.rooms.set(client.id, userRoom);
        return true;
    }

    public deleteConnection(client: ClientSocket): boolean {
        if (!client.id) return false;
        client.client.clearPingTimeout();
        client.client.leaveAll();
        return this.rooms.delete(client.id);
    }

    public getConnection(clientId: string): ClientSocket {
        const [client] = Array.from(this.rooms.get(clientId) ?? []);

        return client;
    }
}
