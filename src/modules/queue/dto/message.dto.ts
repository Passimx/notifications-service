export class MessageDto {
    readonly to: string;
    readonly event: string;
    readonly data: object | string;
}
