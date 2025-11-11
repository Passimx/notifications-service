import process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from '../utils/boolean.utils';

config();
export const Envs = {
    main: {
        host: '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.NOTIFICATION_SERVICE_APP_PORT, 7021),
        socketIoPort: NumbersUtils.toNumberOrDefault(process.env.NOTIFICATION_SERVICE_SOCKET_PORT_NOTIFICATIONT, 7022),
        pingTime: NumbersUtils.toNumberOrDefault(process.env.PING_TIME, 25000),
        socketIdSecret: process.env.NOTIFICATION_SERVICE_SOCKET_ID_SECRET || 'sha256',
    },

    swagger: {
        path: process.env.SWAGGER_PATH || 'docs',
        isWriteConfig: BooleanUtils.strToBoolWithDefault(process.env.SWAGGER_IS_WRITE_CONFIG, false),
        url: `http://localhost:${process.env.APP_PORT ?? 3000}`,
        description: 'development',
    },

    kafka: {
        host: process.env.KAFKA_HOST || 'kafka',
        port: NumbersUtils.toNumberOrDefault(process.env.KAFKA_EXTERNAL_PORT, 9094),
        user: process.env.KAFKA_CLIENT_USERS || 'user',
        password: process.env.KAFKA_USER_PASSWORD || 'bitnami',
        groupId: process.env.NOTIFICATION_SERVICE_KAFKA_GROUP_ID || 'notifications-service',
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, true),
    },

    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: NumbersUtils.toNumberOrDefault(process.env.REDIS_PORT, 6379),
    },
};
