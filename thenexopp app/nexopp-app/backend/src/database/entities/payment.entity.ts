import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';
import { EarningEntity } from './earning.entity';

export enum PaymentStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column({ type: 'uuid', nullable: true })
  earningId: string;

  @ManyToOne(() => EarningEntity, (earning) => earning.payments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'earningId' })
  earning: EarningEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  transactionId: string;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string; // UPI, NEFT, RTGS, IMPS

  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.COMPLETED })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentProofKey: string; // MinIO private key

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previousPendingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingPendingAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
