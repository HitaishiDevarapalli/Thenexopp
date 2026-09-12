import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';
import { PropertyImageEntity } from './property-image.entity';
import { PropertyVerificationEntity } from './property-verification.entity';

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PropertyCategory {
  RESIDENTIAL_RENT = 'RESIDENTIAL_RENT',
  RESIDENTIAL_SALE = 'RESIDENTIAL_SALE',
  COMMERCIAL_RENT = 'COMMERCIAL_RENT',
  COMMERCIAL_SALE = 'COMMERCIAL_SALE',
  BUSINESS = 'BUSINESS',
}

@Entity('properties')
export class PropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ type: 'simple-enum', enum: PropertyCategory })
  category: PropertyCategory;

  @Column({ type: 'simple-json', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  @Column({ type: 'simple-enum', enum: PropertyStatus, default: PropertyStatus.DRAFT })
  status: PropertyStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @OneToMany(() => PropertyImageEntity, (image) => image.property, { cascade: true })
  images: PropertyImageEntity[];

  @OneToMany(() => PropertyVerificationEntity, (verification) => verification.property)
  verifications: PropertyVerificationEntity[];

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
