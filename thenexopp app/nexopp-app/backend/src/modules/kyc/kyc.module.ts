import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycDocumentEntity } from '../../database/entities/kyc-document.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([KycDocumentEntity, AgentEntity]), WebsocketModule],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
