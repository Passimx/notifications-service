import { Controller, Inject, UseFilters } from '@nestjs/common';
import { EventPattern, RpcException } from '@nestjs/microservices';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { KafkaExceptionFilter } from '../exceptionFilters/RpcExceptionFilter';
import { MessageDto } from './dto/message.dto';

@Controller()
@UseFilters(KafkaExceptionFilter)
export class QueueController {
    constructor(@Inject(WsServer) private readonly wsServer: WsServer) {}

    @EventPattern('emit')
    @ApiMessageResponseDecorator()
    emit(body: MessageDto) {
        if (!body) {
            throw new RpcException('Body is required');
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
