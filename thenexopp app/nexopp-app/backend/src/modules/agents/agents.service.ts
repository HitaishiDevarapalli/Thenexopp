import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { AgentProfileEntity } from '../../database/entities/agent-profile.entity';
import { UserEntity, UserRole } from '../../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AgentWebSocketGateway } from '../websocket/agent-websocket.gateway';
import { FileStorageUtil } from '../../common/utils/crypto.util';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentProfileEntity)
    private readonly profileRepository: Repository<AgentProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly wsGateway: AgentWebSocketGateway,
  ) {}

  private async findOrCreateAgent(identifier: string): Promise<AgentEntity> {
    let agent = await this.agentRepository.findOne({
      where: [{ userId: identifier }, { id: identifier }],
      relations: ['profile', 'kyc', 'bankAccount', 'user'],
    });

    if (!agent) {
      let user = await this.userRepository.findOne({
        where: [{ id: identifier }, { mobileNumber: identifier }],
      });

      if (!user) {
        user = this.userRepository.create({
          id: identifier && identifier.includes('-') ? identifier : undefined,
          mobileNumber: identifier && identifier.length >= 10 ? identifier : '9848099999',
          role: UserRole.AGENT,
          isActive: true,
        });
        user = await this.userRepository.save(user);
      }

      agent = this.agentRepository.create({
        userId: user.id,
        status: AgentStatus.NEW,
      });
      agent = await this.agentRepository.save(agent);
      agent.user = user;
    }

    return agent;
  }

  async getProfile(userId: string) {
    const agent = await this.findOrCreateAgent(userId);

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
    const agent = await this.findOrCreateAgent(userId);

    // If profilePhotoUrl is base64, save it to disk and keep clean key
    if (dto.profilePhotoUrl && dto.profilePhotoUrl.startsWith('data:')) {
      dto.profilePhotoUrl = FileStorageUtil.saveBase64File(dto.profilePhotoUrl, 'private-kyc') || dto.profilePhotoUrl;
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
      agent.status = AgentStatus.KYC_INCOMPLETE;
    }

    // Broadcast live WebSocket event to Admin
    this.wsGateway.emitToAdmin('agent.registered', {
      agentId: agent.id,
      fullName: dto.fullName,
      mobileNumber: agent.user?.mobileNumber,
      areaLocation: dto.areaLocation,
      status: agent.status,
    });
    this.wsGateway.emitToAdmin('agent.status.updated', {
      agentId: agent.id,
      status: agent.status,
    });

    return this.getProfile(userId);
  }
}
