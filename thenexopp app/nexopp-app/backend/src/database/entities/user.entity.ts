import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { AgentEntity } from './agent.entity';

export enum UserRole {
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  mobileNumber: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.AGENT })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => AgentEntity, (agent) => agent.user)
  agent: AgentEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
