import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { UploadsService, BucketType } from '../uploads/uploads.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly uploadsService: UploadsService,
  ) {}

  async getPaymentsForAgent(userId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const payments = await this.paymentRepository.find({
      where: { agentId: agent.id },
      relations: ['earning'],
      order: { paidAt: 'DESC' },
    });

    const result = await Promise.all(
      payments.map(async (p) => {
        let proofUrl = null;
        if (p.paymentProofKey) {
          proofUrl = await this.uploadsService.getPresignedReadUrl(BucketType.PAYMENT, p.paymentProofKey);
        }

        return {
          id: p.id,
          amount: Number(p.amount),
          transactionId: p.transactionId,
          paymentMethod: p.paymentMethod,
          previousPendingAmount: p.previousPendingAmount !== null && p.previousPendingAmount !== undefined ? Number(p.previousPendingAmount) : null,
          remainingPendingAmount: p.remainingPendingAmount !== null && p.remainingPendingAmount !== undefined ? Number(p.remainingPendingAmount) : null,
          notes: p.notes || null,
          status: p.status,
          paidAt: p.paidAt,
          paymentProofKey: p.paymentProofKey,
          paymentProofUrl: proofUrl,
          earningTitle: p.earning ? p.earning.title : 'Direct Payout',
        };
      }),
    );

    return {
      success: true,
      data: result,
    };
  }

  async getPaymentById(userId: string, paymentId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['earning'],
    });

    if (!payment || payment.agentId !== agent.id) {
      throw new NotFoundException('Payment record not found');
    }

    let proofUrl = null;
    if (payment.paymentProofKey) {
      proofUrl = await this.uploadsService.getPresignedReadUrl(BucketType.PAYMENT, payment.paymentProofKey);
    }

    return {
      success: true,
      data: {
        id: payment.id,
        amount: Number(payment.amount),
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        previousPendingAmount: payment.previousPendingAmount !== null && payment.previousPendingAmount !== undefined ? Number(payment.previousPendingAmount) : null,
        remainingPendingAmount: payment.remainingPendingAmount !== null && payment.remainingPendingAmount !== undefined ? Number(payment.remainingPendingAmount) : null,
        notes: payment.notes || null,
        status: payment.status,
        paidAt: payment.paidAt,
        paymentProofKey: payment.paymentProofKey,
        paymentProofUrl: proofUrl,
        earningTitle: payment.earning ? payment.earning.title : 'Direct Payout',
      },
    };
  }
}
