import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { AgentProfileEntity } from './agent-profile.entity';
import { KycDocumentEntity } from './kyc-document.entity';
import { BankAccountEntity } from './bank-account.entity';
import { PropertyEntity } from './property.entity';
import { EarningEntity } from './earning.entity';
import { PaymentEntity } from './payment.entity';
import { NotificationEntity } from './notification.entity';

export enum AgentStatus {
  NEW = 'NEW',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  KYC_INCOMPLETE = 'KYC_INCOMPLETE',
  BANK_DETAILS_INCOMPLETE = 'BANK_DETAILS_INCOMPLETE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'simple-enum', enum: AgentStatus, default: AgentStatus.NEW })
  status: AgentStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @OneToOne(() => AgentProfileEntity, (profile) => profile.agent)
  profile: AgentProfileEntity;

  @OneToOne(() => KycDocumentEntity, (kyc) => kyc.agent)
  kyc: KycDocumentEntity;

  @OneToOne(() => BankAccountEntity, (bank) => bank.agent)
  bankAccount: BankAccountEntity;

  @OneToMany(() => PropertyEntity, (property) => property.agent)
  properties: PropertyEntity[];

  @OneToMany(() => EarningEntity, (earning) => earning.agent)
  earnings: EarningEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.agent)
  payments: PaymentEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.agent)
  notifications: NotificationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
