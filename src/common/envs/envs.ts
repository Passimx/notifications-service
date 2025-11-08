import process from 'process';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from '../utils/boolean.utils';

config();
export const Envs = {
    main: {
        host: '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.NOTIFICATION_SERVICE_APP_PORT, 3000),
        socketIoPort: NumbersUtils.toNumberOrDefault(process.env.NOTIFICATION_SERVICE_SOCKET_PORT_NOTIFICATIONT, 3000),
        pingTime: NumbersUtils.toNumberOrDefault(process.env.PING_TIME, 25000),
        socketIdSecret: process.env.NOTIFICATION_SERVICE_SOCKET_ID_SECRET || randomUUID(),
    },

    swagger: {
        path: process.env.SWAGGER_PATH || 'docs',
        isWriteConfig: BooleanUtils.strToBoolWithDefault(process.env.SWAGGER_IS_WRITE_CONFIG, false),
        url: `http://localhost:${process.env.APP_PORT ?? 3000}`,
        description: 'development',
    },

    kafka: {
        host: process.env.KAFKA_HOST,
        port: process.env.KAFKA_EXTERNAL_PORT,
        user: String(process.env.KAFKA_CLIENT_USERS),
        password: String(process.env.KAFKA_USER_PASSWORD),
        groupId: String(process.env.NOTIFICATION_SERVICE_KAFKA_GROUP_ID),
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, false),
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
};
