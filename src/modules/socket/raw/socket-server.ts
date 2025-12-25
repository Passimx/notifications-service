import { Injectable } from '@nestjs/common';
import { ClientSocket } from '../types/client-socket.type';
import { EventsEnum } from '../types/event.enum';

@Injectable()
export class WsServer {
    public connections: Map<string, ClientSocket> = new Map();
    public userRooms: Map<string, Set<string>> = new Map();
    public chats: Map<string, Set<string>> = new Map();
    public selectedClients: Set<ClientSocket> = new Set();

    public joinConnection(socket: ClientSocket) {
        const connectionName = socket.id;
        this.connections.set(connectionName, socket);
    }

    public joinUserRoom(socket: ClientSocket) {
        const connectionName = socket.id;
        const userRoomName = socket.client.userId;
        const userRoom = this.userRooms.get(userRoomName) ?? new Set<string>();
        userRoom.add(connectionName);
        this.userRooms.set(userRoomName, userRoom);
    }

    public joinChat(userRoomName: string, ...chatNames: string[]): boolean {
        const userRoom = this.userRooms.get(userRoomName);
        if (!userRoom) return false;

        for (const chatName of chatNames) {
            const chat = this.chats.get(chatName) ?? new Set<string>();
            chat.add(userRoomName);
            this.chats.set(chatName, chat);
        }

        return true;
    }

    public leaveConnection(client: ClientSocket) {
        client.client.clearPingTimeout();

        const connectionName = client.id;
        this.connections.delete(connectionName);

        const userRoomName = client.client.userId;
        const userRoom = this.userRooms.get(userRoomName);
        userRoom.delete(connectionName);
        this.userRooms.set(userRoomName, userRoom);
    }

    public leaveChat(userRoomName: string, ...chatNames: string[]): boolean {
        const userRoom = this.userRooms.get(userRoomName);
        if (!userRoom) return false;

        for (const chatName of chatNames) {
            let chat = this.chats.get(chatName);
            if (!chat) continue;

            chat.delete(userRoomName);
            if (chat.size) chat = undefined;

            this.chats.set(chatName, chat);
        }

        return true;
    }

    public emit(event: EventsEnum, data: unknown): void {
        if (!this.selectedClients.size) return;
        this.selectedClients.forEach((client) => client?.send(JSON.stringify({ event, data })));
    }

    public toConnection(connectionName: string) {
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const connections = new Map<string, ClientSocket>(this.connections);
        const userRooms = new Map<string, Set<string>>(this.userRooms);
        const chats = new Map<string, Set<string>>(this.chats);

        const connection = this.connections.get(connectionName);
        selectedClients.add(connection);

        return this.createNewInstance(connections, userRooms, chats, selectedClients);
    }

    public toUserRoom(userRoomName: string) {
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const connections = new Map<string, ClientSocket>(this.connections);
        const userRooms = new Map<string, Set<string>>(this.userRooms);
        const chats = new Map<string, Set<string>>(this.chats);

        const userRoom = this.userRooms.get(userRoomName);
        userRoom?.forEach((connectionName) => {
            const connection = this.connections.get(connectionName);
            selectedClients.add(connection);
        });

        return this.createNewInstance(connections, userRooms, chats, selectedClients);
    }

    public toChat(chatName: string) {
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const connections = new Map<string, ClientSocket>(this.connections);
        const userRooms = new Map<string, Set<string>>(this.userRooms);
        const chats = new Map<string, Set<string>>(this.chats);

        const chat = this.chats.get(chatName);
        chat?.forEach((userRoomName) => {
            const userRoom = this.userRooms.get(userRoomName);
            userRoom?.forEach((connectionName) => {
                const connection = this.connections.get(connectionName);
                selectedClients.add(connection);
            });
        });

        return this.createNewInstance(connections, userRooms, chats, selectedClients);
    }

    private createNewInstance(
        connections: Map<string, ClientSocket>,
        userRooms: Map<string, Set<string>>,
        chats: Map<string, Set<string>>,
        selectedClients: Set<ClientSocket>,
    ): WsServer {
        const instance = new WsServer();
        instance.connections = connections;
        instance.userRooms = userRooms;
        instance.chats = chats;
        instance.selectedClients = selectedClients;

        return instance;
    }
}
