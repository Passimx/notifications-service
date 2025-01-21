import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Envs } from '../../common/envs/envs';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { InjectEnum } from './type/inject.enum';

@Module({
    controllers: [QueueController],

    imports: [
        ClientsModule.register([
            {
                name: InjectEnum.NOTIFICATIONS_MICROSERVICE,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                        sasl: { username: Envs.kafka.user, password: Envs.kafka.password, mechanism: 'plain' },
                    },
                    consumer: {
                        groupId: 'chat-group',
                    },
                },
            },
        ]),
    ],

    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule {}
