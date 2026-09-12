import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class AgentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AgentWebSocketGateway.name);
  private connectedAgents = new Map<string, Set<string>>(); // agentId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(`WebSocket connection attempt without token from ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET', 'tnx_access_secret_super_secure_key_987654321_2026_prod'),
      });

      client.data.user = payload;
      const agentId = payload.agentId;

      if (agentId) {
        client.join(`agent_${agentId}`);
        if (!this.connectedAgents.has(agentId)) {
          this.connectedAgents.set(agentId, new Set());
        }
        this.connectedAgents.get(agentId).add(client.id);
        this.logger.log(`Agent ${agentId} connected on socket ${client.id}`);
      } else if (payload.role === 'ADMIN') {
        client.join('admin_room');
        this.logger.log(`Admin user connected on socket ${client.id}`);
      }
    } catch (err) {
      this.logger.error(`WebSocket authentication failed for ${client.id}: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const agentId = client.data?.user?.agentId;
    if (agentId && this.connectedAgents.has(agentId)) {
      this.connectedAgents.get(agentId).delete(client.id);
      if (this.connectedAgents.get(agentId).size === 0) {
        this.connectedAgents.delete(agentId);
      }
    }
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Helper method to emit live updates to a specific agent
  emitToAgent(agentId: string, eventName: string, data: any) {
    this.logger.log(`Emitting event '${eventName}' to agent_${agentId}: ${JSON.stringify(data)}`);
    const payload = { ...data, agentId };
    this.server.to(`agent_${agentId}`).emit(eventName, payload);
  }

  // Helper method to emit live updates to admin portal
  emitToAdmin(eventName: string, data: any) {
    this.logger.log(`Emitting event '${eventName}' to admin_room`);
    this.server.to('admin_room').emit(eventName, data);
  }

  // Broadcast to all connected clients
  broadcast(eventName: string, data: any) {
    this.server.emit(eventName, data);
  }
}
