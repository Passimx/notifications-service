import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';

@Module({
    controllers: [ConnectionsController],
})
export class ConnectionsModule {}
