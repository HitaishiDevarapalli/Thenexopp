import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountEntity } from '../../database/entities/bank-account.entity';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { SubmitBankDetailsDto } from './dto/submit-bank-details.dto';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);

  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankRepository: Repository<BankAccountEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async getBankDetails(userId: string) {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['bankAccount'],
    });

    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    if (!agent.bankAccount) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        accountLast4: `XXXX XXXX ${agent.bankAccount.accountLast4}`,
        ifscCode: agent.bankAccount.ifscCode,
        upiId: agent.bankAccount.upiId,
        phonepeNumber: agent.bankAccount.phonepeNumber,
        isVerified: agent.bankAccount.isVerified,
      },
    };
  }

  async submitBankDetails(userId: string, dto: SubmitBankDetailsDto) {
    if (dto.accountNumber !== dto.confirmAccountNumber) {
      throw new BadRequestException('Account number and confirmation do not match');
    }

    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['bankAccount'],
    });

    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    const cleanAccount = dto.accountNumber.replace(/\D/g, '');
    const accountEncrypted = CryptoUtil.encrypt(cleanAccount);
    const accountLast4 = cleanAccount.slice(-4);

    let bank = agent.bankAccount;
    if (!bank) {
      bank = await this.bankRepository.findOne({ where: { agentId: agent.id } });
    }
    if (!bank) {
      bank = this.bankRepository.create({
        agentId: agent.id,
        accountNumberEncrypted: accountEncrypted,
        accountLast4,
        ifscCode: dto.ifscCode.toUpperCase(),
        upiId: dto.upiId.trim(),
        phonepeNumber: dto.phonepeNumber,
        isVerified: true,
      });
    } else {
      bank.agentId = agent.id;
      bank.accountNumberEncrypted = accountEncrypted;
      bank.accountLast4 = accountLast4;
      bank.ifscCode = dto.ifscCode.toUpperCase();
      bank.upiId = dto.upiId.trim();
      bank.phonepeNumber = dto.phonepeNumber;
      bank.isVerified = true;
    }

    await this.bankRepository.save(bank);

    // Transition state from BANK_DETAILS_INCOMPLETE to PENDING_APPROVAL
    if (agent.status === AgentStatus.BANK_DETAILS_INCOMPLETE || agent.status === AgentStatus.NEW || agent.status === AgentStatus.KYC_INCOMPLETE || agent.status === AgentStatus.PROFILE_INCOMPLETE) {
      await this.agentRepository.update(agent.id, { status: AgentStatus.PENDING_APPROVAL });
    }

    return this.getBankDetails(userId);
  }
}
