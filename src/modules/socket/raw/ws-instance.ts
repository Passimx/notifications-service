import { ClientSocket } from '../types/client-socket.type';
import { EventsEnum } from '../types/event.enum';
import { DataResponse } from '../../queue/dto/data-response.dto';

export class WsInstance {
    public readonly rooms: Map<string, Set<ClientSocket>>;
    private readonly selectedClients: Set<ClientSocket>;

    constructor(
        rooms: Map<string, Set<ClientSocket>> = new Map<string, Set<ClientSocket>>(),
        selectedClients: Set<ClientSocket> = new Set<ClientSocket>(),
    ) {
        this.rooms = rooms;
        this.selectedClients = selectedClients;
    }

    public to(roomName: string): WsInstance {
        const room = new Set(this.rooms.get(roomName));
        const selectedClients = new Set<ClientSocket>(this.selectedClients);

        if (room) room.forEach((client) => selectedClients.add(client));
        const rooms = new Map<string, Set<ClientSocket>>(this.rooms);

        return new WsInstance(rooms, selectedClients);
    }

    public emit(event: EventsEnum, data: DataResponse<unknown>): void {
        if (!this.selectedClients.size) return;
        this.selectedClients.forEach((client) => client.send(JSON.stringify({ event, data })));
    }

    public except(roomName: string): WsInstance {
        const rooms = new Map(this.rooms);
        const selectedClients = new Set<ClientSocket>(this.selectedClients);
        const exceptedRoom = this.rooms.get(roomName);

        if (exceptedRoom) exceptedRoom.forEach((client) => selectedClients.delete(client));

        return new WsInstance(rooms, selectedClients);
    }

    public intersect(...intersectRooms: string[]): WsInstance {
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

        return new WsInstance(rooms, selectedClients);
    }
}
