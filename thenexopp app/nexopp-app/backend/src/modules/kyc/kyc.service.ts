import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycDocumentEntity, KycStatus } from '../../database/entities/kyc-document.entity';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { UserEntity, UserRole } from '../../database/entities/user.entity';
import { CryptoUtil, FileStorageUtil } from '../../common/utils/crypto.util';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { AgentWebSocketGateway } from '../websocket/agent-websocket.gateway';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KycDocumentEntity)
    private readonly kycRepository: Repository<KycDocumentEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly wsGateway: AgentWebSocketGateway,
  ) {}

  private async findOrCreateAgent(identifier: string): Promise<AgentEntity> {
    let agent = await this.agentRepository.findOne({
      where: [{ userId: identifier }, { id: identifier }],
      relations: ['kyc', 'user'],
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
        status: AgentStatus.KYC_INCOMPLETE,
      });
      agent = await this.agentRepository.save(agent);
      agent.user = user;
    }
    return agent;
  }

  async getKycDetails(userId: string) {
    const agent = await this.findOrCreateAgent(userId);

    if (!agent.kyc) {
      return {
        success: true,
        data: {
          status: KycStatus.NOT_SUBMITTED,
          aadhaarMasked: null,
          panMasked: null,
          rejectionReason: null,
        },
      };
    }

    return {
      success: true,
      data: {
        status: agent.kyc.status,
        aadhaarMasked: `XXXX XXXX ${agent.kyc.aadhaarLast4}`,
        panMasked: agent.kyc.panMasked,
        aadhaarDocKey: agent.kyc.aadhaarDocKey,
        panDocKey: agent.kyc.panDocKey,
        rejectionReason: agent.kyc.rejectionReason,
        submittedAt: agent.kyc.submittedAt,
        reviewedAt: agent.kyc.reviewedAt,
      },
    };
  }

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const agent = await this.findOrCreateAgent(userId);

    // If documents are base64, save them to disk and keep clean key
    if (dto.aadhaarDocKey && dto.aadhaarDocKey.startsWith('data:')) {
      dto.aadhaarDocKey = FileStorageUtil.saveBase64File(dto.aadhaarDocKey, 'private-kyc') || dto.aadhaarDocKey;
    }
    if (dto.panDocKey && dto.panDocKey.startsWith('data:')) {
      dto.panDocKey = FileStorageUtil.saveBase64File(dto.panDocKey, 'private-kyc') || dto.panDocKey;
    }

    // Encrypt sensitive numbers with AES-256
    const aadhaarEncrypted = CryptoUtil.encrypt(dto.aadhaarNumber.replace(/\D/g, ''));
    const aadhaarLast4 = dto.aadhaarNumber.replace(/\D/g, '').slice(-4);
    const panEncrypted = CryptoUtil.encrypt(dto.panNumber.trim().toUpperCase());
    const panMasked = CryptoUtil.maskPan(dto.panNumber);

    let kyc = agent.kyc;
    if (!kyc) {
      kyc = await this.kycRepository.findOne({ where: { agentId: agent.id } });
    }
    if (!kyc) {
      kyc = this.kycRepository.create({
        agentId: agent.id,
        aadhaarNumberEncrypted: aadhaarEncrypted,
        aadhaarLast4,
        panNumberEncrypted: panEncrypted,
        panMasked,
        aadhaarDocKey: dto.aadhaarDocKey,
        panDocKey: dto.panDocKey,
        status: KycStatus.UNDER_REVIEW,
        submittedAt: new Date(),
      });
    } else {
      kyc.agentId = agent.id;
      kyc.aadhaarNumberEncrypted = aadhaarEncrypted;
      kyc.aadhaarLast4 = aadhaarLast4;
      kyc.panNumberEncrypted = panEncrypted;
      kyc.panMasked = panMasked;
      kyc.aadhaarDocKey = dto.aadhaarDocKey;
      kyc.panDocKey = dto.panDocKey;
      kyc.status = KycStatus.UNDER_REVIEW;
      kyc.submittedAt = new Date();
      kyc.rejectionReason = null;
    }

    await this.kycRepository.save(kyc);

    // Transition state
    if (agent.status === AgentStatus.KYC_INCOMPLETE || agent.status === AgentStatus.NEW || agent.status === AgentStatus.PROFILE_INCOMPLETE) {
      await this.agentRepository.update(agent.id, { status: AgentStatus.BANK_DETAILS_INCOMPLETE });
    }

    // Real-time broadcast to Admin Portal
    this.wsGateway.emitToAdmin('kyc.status.updated', {
      agentId: agent.id,
      status: kyc.status,
    });

    return this.getKycDetails(userId);
  }
}
