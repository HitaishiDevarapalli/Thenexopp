import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AgentWebSocketGateway } from './agent-websocket.gateway';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [AgentWebSocketGateway],
  exports: [AgentWebSocketGateway],
})
export class WebsocketModule {}
