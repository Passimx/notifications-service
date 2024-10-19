import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule);
    await app.listen(3000);
}
bootstrap();
