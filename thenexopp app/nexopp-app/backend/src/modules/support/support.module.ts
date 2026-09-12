import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicketEntity } from '../../database/entities/support-ticket.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicketEntity, AgentEntity]),
    WebsocketModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
