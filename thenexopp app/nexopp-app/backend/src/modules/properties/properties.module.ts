import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { UploadsModule } from '../uploads/uploads.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyImageEntity, AgentEntity]),
    UploadsModule,
    WebsocketModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
