import { Controller, HttpException, HttpStatus, Inject, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { HttpExceptionFilter } from '../exceptionFilters/http-exception.filter';
import { MessageDto } from './dto/message.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class QueueController {
    constructor(@Inject(WsServer) private readonly wsServer: WsServer) {}

    @EventPattern('emit')
    @ApiMessageResponseDecorator()
    emit(body: MessageDto) {
        if (!body) {
            throw new HttpException('Body is required', HttpStatus.BAD_REQUEST);
        }
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
