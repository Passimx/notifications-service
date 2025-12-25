import { Controller, Get } from '@nestjs/common';
import { rooms } from '../socket/socket.gateway';

@Controller()
export class HttpController {
    @Get('rooms')
    getRooms() {
        const connections = Array.from(rooms.connections.keys()).map((key) => {
            const connection = rooms.connections.get(key)?.id;
            return { key, connection };
        });

        const userRooms = Array.from(rooms.userRooms.keys()).map((key) => {
            const set = rooms.userRooms.get(key);
            const connections = Array.from(set ?? new Set<string>());

            return { key, connections };
        });

        const chats = Array.from(rooms.chats.keys()).map((key) => {
            const set = rooms.chats.get(key);
            const userRooms = Array.from(set ?? new Set<string>());

            return { key, userRooms };
        });

        return { connections, userRooms, chats };
    }
}
