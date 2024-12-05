import { applyDecorators, Get } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { MessageDto } from '../../modules/queue/dto/message.dto';

export const ApiMessageResponseDecorator = () =>
    applyDecorators(
        ApiExtraModels(MessageDto),
        Get('message'),
        ApiOperation({ description: `событие message` }),
        ApiOkResponse({
            schema: {
                properties: {
                    event: { type: 'string', description: 'название метода', example: 'message' },
                    data: { $ref: getSchemaPath(MessageDto) },
                },
            },
        }),
    );
