import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import socketServer from '../socket/raw/socket-server';

@ApiTags('Connections')
@Controller('connections')
export class ConnectionsController {
    @Get('rooms')
    getRooms(): string[] {
        return Array.from(socketServer.rooms.keys());
    }
}
