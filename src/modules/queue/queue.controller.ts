import { Controller, Inject, OnModuleInit, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { KafkaExceptionFilter } from '../exceptionFilters/RpcExceptionFilter';
import { MessageDto } from './dto/message.dto';

@Controller()
@UseFilters(KafkaExceptionFilter)
export class QueueController implements OnModuleInit {
    constructor(@Inject(WsServer) private readonly wsServer: WsServer) {}

    onModuleInit() {
        this.wsServer.putSystemChat();
    }

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

    @EventPattern('system_chats')
    getSystemChats(body: MessageDto<string[]>) {
        const { data } = body.data;

        const chatIds = Array.isArray(data) ? data : [data];
        this.wsServer.getSystemChats(chatIds);
    }
}
