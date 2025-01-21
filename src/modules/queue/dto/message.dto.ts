import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { EventsEnum } from '../../socket/types/event.enum';
import { DataResponse } from './data-response.dto';

export class MessageDto<T = unknown> {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly to: string;

    @ApiProperty({ enum: EventsEnum })
    @IsString()
    @IsNotEmpty()
    @IsEnum(EventsEnum)
    readonly event: EventsEnum;

    @ApiProperty({ type: DataResponse })
    @IsObject()
    readonly data: DataResponse<T>;

    constructor(to: string, event: EventsEnum, data: DataResponse<T>) {
        this.to = to;
        this.event = event;
        this.data = data;
    }
}
