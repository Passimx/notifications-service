import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Envs } from '../envs/envs';

export const ApiController = (): ClassDecorator => {
    if (!Envs.swagger.isWriteConfig) return ApiTags();

    return Controller();
};
