import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Transport } from '@nestjs/microservices';
import { Envs } from '../../envs/envs';

export async function useKafka(app: NestFastifyApplication) {
    if (Envs.kafka.kafkaIsConnect) {
        app.connectMicroservice({
            name: 'CLIENT_KAFKA',
            transport: Transport.KAFKA,
            options: {
                client: {
                    brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                    sasl: {
                        username: Envs.kafka.user,
                        password: Envs.kafka.password,
                        mechanism: 'plain',
                    },
                },
                consumer: {
                    groupId: 'tit-notification-service',
                },
            },
        });

        await app.startAllMicroservices();
    }
}
