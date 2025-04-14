import { ApiProperty } from '@nestjs/swagger';

export class DataResponse<T> {
    @ApiProperty()
    readonly success: boolean;

    @ApiProperty()
    readonly data: string | T;

    constructor(data: string | T, success?: boolean) {
        if (success == undefined) this.success = typeof data !== 'string';
        else this.success = success;

        this.data = data;
    }
}
