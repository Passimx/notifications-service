import { Transport } from '@nestjs/microservices';
import { INestApplication } from '@nestjs/common';
import { Envs } from '../../envs/envs';

export async function useKafka(app: INestApplication) {
    if (Envs.kafka.kafkaIsConnect) {
        app.connectMicroservice({
            name: 'CLIENT_KAFKA',
            transport: Transport.KAFKA,
            options: {
                createTopics: true,
                client: {
                    brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                    sasl: {
                        username: Envs.kafka.user,
                        password: Envs.kafka.password,
                        mechanism: 'plain',
                    },
                },
                consumer: {
                    groupId: Envs.kafka.groupId,
                },
            },
        });

        await app.startAllMicroservices();
    }
}
