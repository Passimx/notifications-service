import process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from '../utils/boolean.utils';

config();
export const Envs = {
    main: {
        host: process.env.APP_HOST || '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.APP_PORT, 3000),
        socketIoPort: NumbersUtils.toNumberOrDefault(process.env.SOCKET_PORT, 3000),
    },

    swagger: {
        path: process.env.SWAGGER_PATH || 'docs',
        isWriteConfig: BooleanUtils.strToBoolWithDefault(process.env.SWAGGER_IS_WRITE_CONFIG, false),
        url: `http://localhost:${process.env.APP_PORT ?? 3000}`,
        description: 'development',
    },

    kafka: {
        host: process.env.KAFKA_HOST,
        port: process.env.KAFKA_PORT,
        user: String(process.env.KAFKA_USER),
        password: String(process.env.KAFKA_PASSWORD),
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, false),
    },
};
