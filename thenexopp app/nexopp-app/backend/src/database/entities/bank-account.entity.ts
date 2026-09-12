import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';

@Entity('bank_accounts')
export class BankAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @OneToOne(() => AgentEntity, (agent) => agent.bankAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column({ type: 'text' })
  accountNumberEncrypted: string;

  @Column({ type: 'varchar', length: 4 })
  accountLast4: string;

  @Column({ type: 'varchar', length: 11 })
  ifscCode: string;

  @Column({ type: 'varchar', length: 100 })
  upiId: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phonepeNumber: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
