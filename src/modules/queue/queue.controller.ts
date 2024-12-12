import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import wsServer from '../socket/raw/socket-server';
import { ApiMessageResponseDecorator } from '../../common/decorators/api-message-response.decorator';
import { MessageDto } from './dto/message.dto';

@Controller()
export class QueueController {
    @EventPattern('emit')
    @ApiMessageResponseDecorator()
    emit(body: MessageDto) {
        wsServer.to(body.to).emit(body.event, body.data);
    }

    @EventPattern('join')
    join(body: MessageDto<number[]>) {
        const { data } = body.data;
        wsServer.join(body.to, ...data.map((num) => num.toString()));
    }
}
