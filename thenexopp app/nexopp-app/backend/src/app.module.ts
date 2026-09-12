import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AgentsModule } from './modules/agents/agents.module';
import { KycModule } from './modules/kyc/kyc.module';
import { BankModule } from './modules/bank/bank.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { EarningsModule } from './modules/earnings/earnings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AdminIntegrationModule } from './modules/admin-integration/admin-integration.module';
import { SupportModule } from './modules/support/support.module';

import { UserEntity } from './database/entities/user.entity';
import { AgentEntity } from './database/entities/agent.entity';
import { AgentProfileEntity } from './database/entities/agent-profile.entity';
import { KycDocumentEntity } from './database/entities/kyc-document.entity';
import { BankAccountEntity } from './database/entities/bank-account.entity';
import { PropertyEntity } from './database/entities/property.entity';
import { PropertyImageEntity } from './database/entities/property-image.entity';
import { PropertyVerificationEntity } from './database/entities/property-verification.entity';
import { EarningEntity } from './database/entities/earning.entity';
import { PaymentEntity } from './database/entities/payment.entity';
import { NotificationEntity } from './database/entities/notification.entity';
import { RefreshTokenEntity } from './database/entities/refresh-token.entity';
import { AuditLogEntity } from './database/entities/audit-log.entity';
import { SupportTicketEntity } from './database/entities/support-ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DATABASE_TYPE', 'sqlite');
        const entities = [
          UserEntity,
          AgentEntity,
          AgentProfileEntity,
          KycDocumentEntity,
          BankAccountEntity,
          PropertyEntity,
          PropertyImageEntity,
          PropertyVerificationEntity,
          EarningEntity,
          PaymentEntity,
          NotificationEntity,
          RefreshTokenEntity,
          AuditLogEntity,
          SupportTicketEntity,
        ];

        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: 'thenexopp_agent_dev.sqlite',
            entities,
            synchronize: true,
            logging: false,
          };
        }

        const host = config.get<string>('DATABASE_HOST', 'localhost');
        const port = config.get<number>('DATABASE_PORT', 5432);
        const username = config.get<string>('DATABASE_USER', 'thenexopp_user');
        const password = config.get<string>('DATABASE_PASSWORD', 'thenexopp_secure_pass_2026');
        const database = config.get<string>('DATABASE_NAME', 'thenexopp_agent_db');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities,
          synchronize: true,
          logging: false,
        };
      },
    }),
    AuthModule,
    AgentsModule,
    KycModule,
    BankModule,
    PropertiesModule,
    EarningsModule,
    PaymentsModule,
    NotificationsModule,
    UploadsModule,
    WebsocketModule,
    AdminIntegrationModule,
    SupportModule,
  ],
})
export class AppModule {}
