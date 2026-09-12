import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EarningEntity, EarningStatus } from '../../database/entities/earning.entity';
import { PaymentEntity, PaymentStatus } from '../../database/entities/payment.entity';
import { AgentEntity } from '../../database/entities/agent.entity';

@Injectable()
export class EarningsService {
  private readonly logger = new Logger(EarningsService.name);

  constructor(
    @InjectRepository(EarningEntity)
    private readonly earningRepository: Repository<EarningEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async getEarningsSummary(userId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const earnings = await this.earningRepository.find({
      where: { agentId: agent.id },
      relations: ['property'],
      order: { earnedDate: 'DESC' },
    });

    const payments = await this.paymentRepository.find({
      where: { agentId: agent.id, status: PaymentStatus.COMPLETED },
      order: { paidAt: 'DESC' },
    });

    const rawEarningsTotal = earnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingEarnings = Math.max(0, rawEarningsTotal - paidAmount);
    const totalEarnings = Math.max(rawEarningsTotal, paidAmount + pendingEarnings);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthEarnings = earnings
      .filter((e) => {
        const d = new Date(e.earnedDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const formattedList = earnings.map((e) => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount || 0),
      status: e.status,
      earnedDate: e.earnedDate,
      propertyTitle: e.property ? e.property.title : null,
    }));

    return {
      success: true,
      data: {
        summary: {
          totalEarnings,
          pendingEarnings,
          paidAmount,
          thisMonthEarnings,
        },
        earnings: formattedList,
      },
    };
  }
}
