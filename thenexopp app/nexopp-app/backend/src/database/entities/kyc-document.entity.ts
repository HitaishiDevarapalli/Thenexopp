import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';

export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('kyc_documents')
export class KycDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @OneToOne(() => AgentEntity, (agent) => agent.kyc, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  // Sensitive encrypted fields
  @Column({ type: 'text' })
  aadhaarNumberEncrypted: string;

  @Column({ type: 'varchar', length: 4 })
  aadhaarLast4: string;

  @Column({ type: 'text' })
  panNumberEncrypted: string;

  @Column({ type: 'varchar', length: 10 })
  panMasked: string;

  @Column({ type: 'text' })
  aadhaarDocKey: string; // MinIO private key or Data URL

  @Column({ type: 'text' })
  panDocKey: string; // MinIO private key or Data URL

  @Column({ type: 'simple-enum', enum: KycStatus, default: KycStatus.NOT_SUBMITTED })
  status: KycStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
