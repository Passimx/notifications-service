import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { version } from '../package.json';
import { AppModule } from './modules/app.module';
import { Envs } from './common/envs/envs';
import { logger } from './common/logger/logger';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule);

    await app.listen(Envs.main.appPort, Envs.main.host);

    const url = await app.getUrl();

    logger.info(`Server is running on url: ${url} at ${Date()}. Version: '${version}'.`);
}

bootstrap();
