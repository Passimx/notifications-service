import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import wsServer from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { MessageDto } from './dto/message.dto';

@Controller()
export class QueueController {
    @EventPattern('message')
    @ApiMessageResponseDecorator()
    sendMessage(body: MessageDto) {
        wsServer.to(body.to).emit(body.event, body.data);
    }
}
