import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';

@Entity('agent_profiles')
export class AgentProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @OneToOne(() => AgentEntity, (agent) => agent.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 150 })
  areaLocation: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 20 })
  gender: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workPlatform?: string; // e.g. Agent, Driver, Business, Freelancer, etc.

  @Column({ type: 'text', nullable: true })
  profilePhotoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
