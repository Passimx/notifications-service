import { ApiProperty } from '@nestjs/swagger';

export class DataResponse<T> {
    @ApiProperty()
    readonly success: boolean;

    @ApiProperty()
    readonly data: T;
}
