import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { EventsEnum } from '../../socket/types/event.enum';
import { DataResponse } from './data-response.dto';

export class MessageDto<T = unknown> {
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

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    readonly publicKey?: string;

    constructor(event: EventsEnum, data: DataResponse<T>, publicKey?: string) {
        this.event = event;
        this.data = data;
        this.publicKey = publicKey;
    }
}
