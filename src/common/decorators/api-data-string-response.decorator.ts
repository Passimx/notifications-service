import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Envs } from '../envs/envs';

export const ApiDataStringResponse = (description?: string, method?: MethodDecorator): MethodDecorator => {
    if (!Envs.swagger.isWriteConfig) return applyDecorators();

    return applyDecorators(
        method,
        ApiOperation({ description: `событие ${description}` }),
        ApiOkResponse({
            schema: {
                properties: {
                    event: { type: 'string', description: 'название метода' },
                    data: {
                        properties: {
                            success: { type: 'boolean', description: 'является ли запрос успешным' },
                            data: { type: 'string' },
                        },
                    },
                },
            },
        }),
    );
};
