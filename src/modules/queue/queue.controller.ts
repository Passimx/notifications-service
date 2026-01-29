import { Controller, Inject, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { KafkaExceptionFilter } from '../exceptionFilters/RpcExceptionFilter';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { TopicsEnum } from '../socket/types/topics.enum';
import { MessageDto } from './dto/message.dto';
import { QueueService } from './queue.service';
import { SendTopicsEnum } from './type/send-topics.enum';
import { SendOnlineDto } from './dto/send-online.dto';

@Controller()
@UseFilters(KafkaExceptionFilter)
export class QueueController {
    constructor(
        @Inject(WsServer) private readonly wsServer: WsServer,
        private readonly queueService: QueueService,
    ) {}

    @EventPattern(TopicsEnum.EMIT_TO_CHAT)
    @ApiMessageResponseDecorator()
    emitToChat(body: MessageDto) {
        this.wsServer.toChat(body.to).emit(body.event, body.data);
    }

    @EventPattern(TopicsEnum.EMIT_TO_USER_ROOM)
    @ApiMessageResponseDecorator()
    emitToUserRoom(body: MessageDto) {
        this.wsServer.toUserRoom(body.to).emit(body.event, body.data);
    }

    @EventPattern(TopicsEnum.JOIN_USER_TO_CHAT)
    joinChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.joinUserToChat(body.to, ...data);
    }

    @EventPattern(TopicsEnum.LEAVE_USER_FROM_CHAT)
    leaveChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.leaveUserFromChat(body.to, ...data);
    }

    @EventPattern(TopicsEnum.JOIN_CONNECTION_TO_CHAT)
    joinConnectionToChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.joinConnectionToChat(body.to, ...data);
    }

    @EventPattern(TopicsEnum.LEAVE_CONNECTION_FROM_CHAT)
    leaveConnectionFromChat(body: MessageDto<string[]>) {
        const { data } = body.data;
        this.wsServer.leaveConnectionFromChat(body.to, ...data);
    }

    @EventPattern(TopicsEnum.JOIN_CONNECTION_TO_USER_ROOM)
    joinConnectionToUserRoom(body: MessageDto<string>) {
        const connection = this.wsServer.connections.get(body.to);
        if (!connection) return;

        connection.client.userId = body.data.data;
        this.wsServer.joinUserRoom(connection);
        this.queueService.sendMessage(
            SendTopicsEnum.ONLINE,
            new SendOnlineDto({
                userId: connection.client.userId,
                sessionId: connection.client.sessionId,
            }),
        );
    }

    @EventPattern(TopicsEnum.LEAVE_CONNECTION_FROM_USER_ROOM)
    leaveConnectionFromUserRoom(body: MessageDto<string>) {
        const connection = this.wsServer.connections.get(body.to);
        if (!connection) return;

        this.wsServer.leaveUserRoom(connection);
    }
}
