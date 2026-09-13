import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from '../../database/entities/agent.entity';
import { AgentProfileEntity } from '../../database/entities/agent-profile.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, AgentProfileEntity, UserEntity]), WebsocketModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
