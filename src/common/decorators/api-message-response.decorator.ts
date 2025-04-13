import { applyDecorators, Get } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { MessageDto } from '../../modules/queue/dto/message.dto';

export const ApiMessageResponseDecorator = () =>
    applyDecorators(
        ApiExtraModels(MessageDto),
        Get('message'),
        ApiOperation({ description: `Событие message` }),
        ApiOkResponse({
            schema: { $ref: getSchemaPath(MessageDto) },
        }),
    );
