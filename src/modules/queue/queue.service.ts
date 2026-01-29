import { Inject, Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';

import { Envs } from '../../common/envs/envs';

import { InjectEnum } from './type/inject.enum';
import { SendTopicsEnum } from './type/send-topics.enum';

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

    public sendMessage(topic: SendTopicsEnum, message: unknown): void {
        if (!Envs.kafka.kafkaIsConnect || !this.isConnected) return;

        this.producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
    }
}
