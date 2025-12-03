import { Controller, Inject, OnModuleInit, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { WsServer } from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { KafkaExceptionFilter } from '../exceptionFilters/RpcExceptionFilter';
import { EventsEnum } from '../socket/types/event.enum';
import { MessageDto } from './dto/message.dto';
import { TopicsEnum } from './type/topics.enum';
import { DataResponse } from './dto/data-response.dto';

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
        if (typeof data === 'string') {
            return;
        }

        this.wsServer.setSystemChats(data);
    }

    @EventPattern(TopicsEnum.VIDEO_CALL_STARTED)
    CallStart(body: DataResponse<{ roomId: string; initiatorId: string; timestamp: string }>) {
        if (typeof body.data === 'string') {
            return;
        }

        const { roomId, initiatorId, timestamp } = body.data;
        const room = this.wsServer.rooms.get(roomId);
        if (!room) return;

        this.wsServer
            .to(roomId)
            .emit(EventsEnum.VIDEO_CALL_STARTED, new DataResponse({ roomId, initiatorId, timestamp }));
    }

    @EventPattern(TopicsEnum.VIDEO_CALL_JOINED)
    CallJoined(body: DataResponse<{ roomId: string; peerId: string; timestamp: string }>) {
        if (typeof body.data === 'string') {
            return;
        }

        const { roomId, peerId, timestamp } = body.data;
        const room = this.wsServer.rooms.get(roomId);
        if (!room) return;

        this.wsServer.to(roomId).emit(EventsEnum.VIDEO_CALL_JOINED, new DataResponse({ roomId, peerId, timestamp }));
    }

    @EventPattern(TopicsEnum.VIDEO_CALL_LEFT)
    CallLeft(body: DataResponse<{ roomId: string; peerId: string; timestamp: string }>) {
        if (typeof body.data === 'string') {
            return;
        }

        const { roomId, peerId, timestamp } = body.data;
        const room = this.wsServer.rooms.get(roomId);
        if (!room) return;

        this.wsServer.to(roomId).emit(EventsEnum.VIDEO_CALL_LEFT, new DataResponse({ roomId, peerId, timestamp }));
    }

    @EventPattern(TopicsEnum.VIDEO_CALL_ENDED)
    CallEnded(body: DataResponse<{ roomId: string; timestamp: string }>) {
        if (typeof body.data === 'string') {
            return;
        }

        const { roomId, timestamp } = body.data;
        const room = this.wsServer.rooms.get(roomId);
        if (!room) return;

        this.wsServer.to(roomId).emit(EventsEnum.VIDEO_CALL_ENDED, new DataResponse({ roomId, timestamp }));
    }
}
