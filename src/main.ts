import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';
import { Envs } from './common/envs/envs';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule);

    await app.listen(Envs.main.appPort, Envs.main.host);
}

bootstrap();
