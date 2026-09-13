import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from '../../database/entities/bank-account.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity, AgentEntity, UserEntity]), WebsocketModule],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
