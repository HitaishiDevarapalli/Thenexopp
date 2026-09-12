import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { AgentProfileEntity } from '../../database/entities/agent-profile.entity';
import { KycDocumentEntity } from '../../database/entities/kyc-document.entity';
import { BankAccountEntity } from '../../database/entities/bank-account.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentProfileEntity)
    private readonly profileRepository: Repository<AgentProfileEntity>,
  ) {}

  async getProfile(userId: string) {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['profile', 'kyc', 'bankAccount', 'user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    return {
      success: true,
      data: {
        agentId: agent.id,
        userId: agent.userId,
        status: agent.status,
        rejectionReason: agent.rejectionReason,
        mobileNumber: agent.user?.mobileNumber,
        profile: agent.profile || null,
        kycStatus: agent.kyc ? agent.kyc.status : 'NOT_SUBMITTED',
        bankStatus: agent.bankAccount ? (agent.bankAccount.isVerified ? 'VERIFIED' : 'SUBMITTED') : 'NOT_SUBMITTED',
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['profile'],
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    let profile = agent.profile;
    if (!profile) {
      profile = await this.profileRepository.findOne({ where: { agentId: agent.id } });
    }

    if (!profile) {
      profile = this.profileRepository.create({
        ...dto,
        agentId: agent.id,
      });
    } else {
      Object.assign(profile, dto);
      profile.agentId = agent.id;
    }

    await this.profileRepository.save(profile);

    // Transition state from NEW / PROFILE_INCOMPLETE to KYC_INCOMPLETE
    if (agent.status === AgentStatus.NEW || agent.status === AgentStatus.PROFILE_INCOMPLETE) {
      await this.agentRepository.update(agent.id, { status: AgentStatus.KYC_INCOMPLETE });
    }

    return this.getProfile(userId);
  }
}
