import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { WsServer } from '../socket/raw/socket-server';
import { MessageDto } from './dto/message.dto';

@Controller()
export class QueueController {
    constructor(private readonly wsServer: WsServer) {}

    @EventPattern('emit')
    @ApiMessageResponseDecorator()
    emit(body: MessageDto) {
        this.wsServer.to(body.to).emit(body.event, body.data);
    }

    @EventPattern('join')
    join(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.join(body.to, ...data);
    }

    @EventPattern('leave')
    leave(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.leave(body.to, ...data);
    }
}
