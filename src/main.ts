import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';
import { version } from '../package.json';
import { AppModule } from './modules/app.module';
import { Envs } from './common/envs/envs';
import { logger } from './common/logger/logger';
import { useSwagger } from './common/config/swagger/use-swagger';
import { useKafka } from './common/config/kafka/use-kafka';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
        bufferLogs: true,
    });

    if (Envs.swagger.isWriteConfig) useSwagger(app);
    if (Envs.kafka.kafkaIsConnect) await useKafka(app);

    app.enableCors({
        origin: ['https://tons-chat.ru', 'http://localhost:3006'], // Разрешаем запросы только с этого домена
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Разрешаем использование кук и токенов
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.listen(Envs.main.appPort, Envs.main.host);

    const url = await app.getUrl();

    logger.info(
        `Server is running on url: ${url.slice(0, -4)}${Envs.main.socketIoPort} at ${Date()}. Version: '${version}'.`,
    );
    logger.info(`Swagger is running on url: ${url}/${Envs.swagger.path} at ${Date()}. Version: '${version}'.`);
}

bootstrap();
