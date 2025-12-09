import { Controller, Get } from '@nestjs/common';
import { rooms } from '../socket/socket.gateway';

@Controller()
export class HttpController {
    @Get('rooms')
    getRooms() {
        return rooms;
    }
}
