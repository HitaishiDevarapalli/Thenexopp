import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AgentEntity } from './agent.entity';
import { PropertyEntity } from './property.entity';
import { PaymentEntity } from './payment.entity';

export enum EarningStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
}

@Entity('earnings')
export class EarningEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.earnings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => PropertyEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'simple-enum', enum: EarningStatus, default: EarningStatus.PENDING })
  status: EarningStatus;

  @Column()
  earnedDate: Date;

  @OneToMany(() => PaymentEntity, (payment) => payment.earning)
  payments: PaymentEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
