import { Inject, Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';

import { Envs } from '../../common/envs/envs';

import { InjectEnum } from './type/inject.enum';
import { TopicsEnum } from './type/topics.enum';
import { DataResponse } from './dto/data-response.dto';

@Injectable()
export class QueueService {
    private readonly producer!: Producer;
    private isConnected: boolean = false;

    constructor(@Inject(InjectEnum.NOTIFICATIONS_MICROSERVICE) private readonly kafkaClient: ClientKafka) {
        if (!Envs.kafka.kafkaIsConnect) return;

        const client = this.kafkaClient.createClient<Kafka>();

        this.producer = client.producer();

        this.producer.connect().then(() => (this.isConnected = true));
    }

    public sendMessage(topic: TopicsEnum, message: DataResponse<unknown>): void {
        if (!Envs.kafka.kafkaIsConnect || !this.isConnected) return;

        this.producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
    }
}
