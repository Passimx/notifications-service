import { Controller, Inject, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { KafkaExceptionFilter } from '../exceptionFilters/RpcExceptionFilter';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { MessageDto } from './dto/message.dto';

@Controller()
@UseFilters(KafkaExceptionFilter)
export class QueueController {
    constructor(@Inject(WsServer) private readonly wsServer: WsServer) {}
    @EventPattern('emit_to_chat')
    @ApiMessageResponseDecorator()
    emitToChat(body: MessageDto) {
        this.wsServer.toChat(body.to).emit(body.event, body.data);
    }

    @EventPattern('emit_to_user_room')
    @ApiMessageResponseDecorator()
    emitToUserRoom(body: MessageDto) {
        this.wsServer.toUserRoom(body.to).emit(body.event, body.data);
    }

    @EventPattern('join')
    joinChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.joinChat(body.to, ...data);
    }

    @EventPattern('leave')
    leaveChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.leaveChat(body.to, ...data);
    }

    // @EventPattern('system_chats')
    // getSystemChats(body: MessageDto<string[]>) {
    //     const { data } = body.data;
    //     if (typeof data === 'string') {
    //         return;
    //     }
    //
    //     this.wsServer.setSystemChats(data);
    // }
}
