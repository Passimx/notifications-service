import { writeFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import projectInfo from '../../../../package.json';
import { Envs } from '../../envs/envs';

export function useSwagger(app: INestApplication): void {
    const documentBuilder = new DocumentBuilder();

    documentBuilder.addServer(Envs.swagger.url, Envs.swagger.description);

    const config = documentBuilder.setTitle(projectInfo.name).setVersion(projectInfo.version).build();

    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });

    SwaggerModule.setup(Envs.swagger.path, app, document, {
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            persistAuthorization: true,
        },
    });

    writeFileSync('./api/swagger.json', JSON.stringify(document, null, '\t'));
}
