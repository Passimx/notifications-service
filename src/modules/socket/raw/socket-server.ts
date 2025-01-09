import { Injectable } from '@nestjs/common';
import { ClientSocket } from '../types/client-socket.type';

@Injectable()
export class WsServer {
    public readonly rooms: Map<string, Set<ClientSocket>>;
    private readonly selectedClients: Set<ClientSocket>;

    constructor(
        rooms: Map<string, Set<ClientSocket>> = new Map<string, Set<ClientSocket>>(),
        selectedClients: Set<ClientSocket> = new Set<ClientSocket>(),
    ) {
        this.rooms = rooms;
        this.selectedClients = selectedClients;
    }

    public leave(clientId: string, ...roomNames: string[]): boolean {
        const [client]: ClientSocket[] = Array.from(this.rooms.get(clientId) ?? []);

        if (!client) return false;

        roomNames.forEach((name) => {
            client.client.rooms.delete(name);

            const correctRoom = this.rooms.get(name);
            if (!correctRoom) return;

            correctRoom.delete(client);
            if (!correctRoom.size) this.rooms.delete(name);
            this.online(name);
        });

        return true;
    }

    public join(clientId: string, ...roomNames: string[]): boolean {
        const [client]: ClientSocket[] = Array.from(this.rooms.get(clientId) ?? []);
        if (!client) return false;

        roomNames.forEach((name) => {
            client.client.rooms.add(name);
            const correctRoom = this.rooms.get(name);

            if (!correctRoom) {
                const newRoom = new Set<ClientSocket>();
                newRoom.add(client);
                this.rooms.set(name, newRoom);
            } else {
                correctRoom.add(client);
            }
            this.online(name);
        });

        return true;
    }

    public online(roomName: string): void {
        const onlineUsers = this.rooms.get(roomName)?.size || 0;
        this.to(roomName).emit('OnlineUsersCount', { onlineUsers });
    }

    public to(roomName: string): WsServer {
        const room = new Set(this.rooms.get(roomName));
        const selectedClients = new Set<ClientSocket>(this.selectedClients);

        if (room) room.forEach((client) => selectedClients.add(client));
        const rooms = new Map<string, Set<ClientSocket>>(this.rooms);

        return new WsServer(rooms, selectedClients);
    }

    public except(roomName: string): WsServer {
        const rooms = new Map(this.rooms);
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const exceptedRoom = this.rooms.get(roomName);

        if (exceptedRoom) exceptedRoom.forEach((client) => selectedClients.delete(client));

        return new WsServer(rooms, selectedClients);
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

        return new WsServer(rooms, selectedClients);
    }

    public emitAll(event: string, data: object | string) {
        const clientsRoom = new Set<ClientSocket>();
        this.rooms.forEach((room) => room.forEach((client) => clientsRoom.add(client)));

        clientsRoom.forEach((client) => client.send(JSON.stringify({ event, data })));
    }

    public emit(event: string, data: object | string): void {
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

        client.client.leaveAll();
        return this.rooms.delete(client.id);
    }

    public getConnection(clientId: string): ClientSocket {
        const [client] = Array.from(this.rooms.get(clientId) ?? []);

        return client;
    }
}

export default new WsServer();
