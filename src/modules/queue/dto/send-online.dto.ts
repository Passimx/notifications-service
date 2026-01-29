export class SendOnlineDto {
    constructor(payload: Partial<SendOnlineDto>) {
        Object.assign(this, payload);
    }

    readonly userId!: string;

    readonly sessionId!: string;
}
