import process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from '../utils/boolean.utils';

config();
export const Envs = {
    main: {
        host: process.env.APP_HOST_NOTIFICATION || '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.APP_PORT_NOTIFICATION, 3000),
        socketIoPort: NumbersUtils.toNumberOrDefault(process.env.SOCKET_PORT_NOTIFICATION, 3000),
        pingTime: NumbersUtils.toNumberOrDefault(process.env.PING_TIME, 25000),
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
        groupId: String(process.env.APP_KAFKA_GROUP_ID_NOTIFICATION),
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, false),
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
};
