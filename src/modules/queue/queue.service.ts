import { Inject, Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';

import { EventsEnum } from '../socket/types/event.enum';

import { Envs } from '../../common/envs/envs';
import wsServer from '../socket/raw/socket-server';
import { MessageDto } from './dto/message.dto';

import { InjectEnum } from './type/inject.enum';
import { TopicsEnum } from './type/topics.enum';
import { DataResponse } from './dto/data-response.dto';

@Injectable()
export class QueueService {
    private readonly producer!: Producer;
    private isConnected: boolean = false;

    constructor(@Inject(InjectEnum.NOTIFICATIONS_MICROSERVICE) private readonly kafkaClient: ClientKafka) {
        if (!Envs.kafka.kafkaIsConnect) return;

        wsServer.setQueueService(this);

        const client = this.kafkaClient.createClient<Kafka>();

        this.producer = client.producer();

        this.producer.connect().then(() => (this.isConnected = true));
    }

    public sendMessage(
        topic: TopicsEnum,
        to: string | undefined,
        event: EventsEnum,
        data: DataResponse<unknown>,
    ): void {
        if (!Envs.kafka.kafkaIsConnect || !this.isConnected || !to) return;

        const message = new MessageDto(to, event, data);

        this.producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
    }
}
