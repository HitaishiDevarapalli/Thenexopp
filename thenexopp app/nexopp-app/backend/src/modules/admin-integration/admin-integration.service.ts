import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { AgentProfileEntity } from '../../database/entities/agent-profile.entity';
import { BankAccountEntity } from '../../database/entities/bank-account.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { KycDocumentEntity, KycStatus } from '../../database/entities/kyc-document.entity';
import { PropertyEntity, PropertyStatus } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { EarningEntity, EarningStatus } from '../../database/entities/earning.entity';
import { PaymentEntity, PaymentStatus } from '../../database/entities/payment.entity';
import { SupportTicketEntity } from '../../database/entities/support-ticket.entity';
import { AgentWebSocketGateway } from '../websocket/agent-websocket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';
import { UploadsService, BucketType } from '../uploads/uploads.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Injectable()
export class AdminIntegrationService {
  private readonly logger = new Logger(AdminIntegrationService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentProfileEntity)
    private readonly profileRepository: Repository<AgentProfileEntity>,
    @InjectRepository(BankAccountEntity)
    private readonly bankRepository: Repository<BankAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(KycDocumentEntity)
    private readonly kycRepository: Repository<KycDocumentEntity>,
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(PropertyImageEntity)
    private readonly imageRepository: Repository<PropertyImageEntity>,
    @InjectRepository(EarningEntity)
    private readonly earningRepository: Repository<EarningEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(SupportTicketEntity)
    private readonly ticketRepository: Repository<SupportTicketEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
    private readonly wsGateway: AgentWebSocketGateway,
    private readonly notificationsService: NotificationsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getAllAgents(status?: AgentStatus, search?: string) {
    const whereCondition: any = status ? { status } : {};
    const agents = await this.agentRepository.find({
      where: whereCondition,
      relations: ['profile', 'kyc', 'bankAccount', 'user', 'properties', 'payments', 'earnings'],
      order: { createdAt: 'DESC' },
    });

    let filtered = agents;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = agents.filter((a) => {
        const name = (a.profile?.fullName || '').toLowerCase();
        const mobile = (a.user?.mobileNumber || '');
        const area = (a.profile?.areaLocation || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || area.includes(q);
      });
    }

    const results = await Promise.all(
      filtered.map(async (a) => {
        const props = a.properties || [];
        const payments = a.payments || [];
        const earnings = a.earnings || [];

        const totalListings = props.length;
        const acceptedListings = props.filter((p) => p.status === PropertyStatus.APPROVED).length;
        const rejectedListings = props.filter((p) => p.status === PropertyStatus.REJECTED).length;
        const pendingListings = props.filter((p) => p.status === PropertyStatus.SUBMITTED || p.status === PropertyStatus.UNDER_REVIEW).length;

        const totalPaid = payments
          .filter((p) => p.status === PaymentStatus.COMPLETED)
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const pendingEarnings = earnings
          .filter((e) => e.status === EarningStatus.PENDING)
          .reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const aadhaarDecrypted = a.kyc?.aadhaarNumberEncrypted ? CryptoUtil.decrypt(a.kyc.aadhaarNumberEncrypted) : null;
        const panDecrypted = a.kyc?.panNumberEncrypted ? CryptoUtil.decrypt(a.kyc.panNumberEncrypted) : null;
        const bankAccountDecrypted = a.bankAccount?.accountNumberEncrypted ? CryptoUtil.decrypt(a.bankAccount.accountNumberEncrypted) : null;

        let aadhaarDocUrl = null;
        let panDocUrl = null;
        let profilePhotoUrl = null;
        if (a.profile?.profilePhotoUrl) {
          try {
            profilePhotoUrl = await this.uploadsService.getPresignedReadUrl(BucketType.KYC, a.profile.profilePhotoUrl);
          } catch (_) {}
        }
        if (a.kyc?.aadhaarDocKey) {
          try {
            aadhaarDocUrl = await this.uploadsService.getPresignedReadUrl(BucketType.KYC, a.kyc.aadhaarDocKey);
          } catch (_) {}
        }
        if (a.kyc?.panDocKey) {
          try {
            panDocUrl = await this.uploadsService.getPresignedReadUrl(BucketType.KYC, a.kyc.panDocKey);
          } catch (_) {}
        }

        return {
          id: a.id,
          userId: a.userId,
          mobileNumber: a.user ? a.user.mobileNumber : null,
          status: a.status,
          rejectionReason: a.rejectionReason,
          fullName: a.profile ? a.profile.fullName : null,
          profilePhotoUrl,
          areaLocation: a.profile ? a.profile.areaLocation : null,
          workPlatform: a.profile ? a.profile.workPlatform : null,
          age: a.profile ? a.profile.age : null,
          gender: a.profile ? a.profile.gender : null,
          kycStatus: a.kyc ? a.kyc.status : 'NOT_SUBMITTED',
          aadhaarLast4: a.kyc ? a.kyc.aadhaarLast4 : null,
          panMasked: a.kyc ? a.kyc.panMasked : null,
          aadhaarFullNumber: aadhaarDecrypted,
          panFullNumber: panDecrypted,
          aadhaarDocKey: a.kyc ? a.kyc.aadhaarDocKey : null,
          panDocKey: a.kyc ? a.kyc.panDocKey : null,
          aadhaarDocUrl,
          panDocUrl,
          bankAccountLast4: a.bankAccount ? a.bankAccount.accountLast4 : null,
          bankAccountFullNumber: bankAccountDecrypted,
          bankIfscCode: a.bankAccount ? a.bankAccount.ifscCode : null,
          bankUpiId: a.bankAccount ? a.bankAccount.upiId : null,
          bankPhonepeNumber: a.bankAccount ? a.bankAccount.phonepeNumber : null,
          submittedAt: a.createdAt,
          totalListings,
          acceptedListings,
          rejectedListings,
          pendingListings,
          totalPaid,
          pendingEarnings,
        };
      }),
    );

    return {
      success: true,
      data: results,
    };
  }

  async getAllProperties(status?: PropertyStatus, startDate?: string, endDate?: string, agentId?: string, search?: string) {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.agent', 'agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .orderBy('property.createdAt', 'DESC');

    if (status) {
      query.andWhere('property.status = :status', { status });
    }

    if (agentId) {
      query.andWhere('property.agentId = :agentId', { agentId });
    }

    if (startDate) {
      const start = new Date(startDate);
      query.andWhere('property.createdAt >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('property.createdAt <= :end', { end });
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      query.andWhere(
        '(property.title ILIKE :q OR property.location ILIKE :q OR profile.fullName ILIKE :q OR user.mobileNumber ILIKE :q)',
        { q },
      );
    }

    const properties = await query.getMany();

    const results = await Promise.all(
      properties.map(async (prop) => {
        const imagesWithUrls = await Promise.all(
          (prop.images || []).map(async (img) => {
            let url = null;
            try {
              url = await this.uploadsService.getPresignedReadUrl(BucketType.PROPERTY, img.imageKey);
            } catch (_) {}
            return {
              id: img.id,
              imageKey: img.imageKey,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
              url,
            };
          }),
        );

        return {
          id: prop.id,
          agentId: prop.agentId,
          agent: {
            id: prop.agent ? prop.agent.id : prop.agentId,
            fullName: prop.agent?.profile?.fullName || 'Agent Partner',
            mobileNumber: prop.agent?.user?.mobileNumber || '',
            areaLocation: prop.agent?.profile?.areaLocation || '',
            workPlatform: prop.agent?.profile?.workPlatform || '',
          },
          title: prop.title,
          description: prop.description,
          price: Number(prop.price),
          commissionAmount: Number(prop.commissionAmount || 0),
          category: prop.category,
          specifications: prop.specifications || {},
          location: prop.location,
          status: prop.status,
          rejectionReason: prop.rejectionReason,
          submittedAt: prop.submittedAt,
          reviewedAt: prop.reviewedAt,
          createdAt: prop.createdAt,
          images: imagesWithUrls,
        };
      }),
    );

    return {
      success: true,
      data: results,
    };
  }

  async getPaymentRecords(startDate?: string, endDate?: string, agentId?: string, search?: string) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.agent', 'agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .leftJoinAndSelect('payment.earning', 'earning')
      .orderBy('payment.paidAt', 'DESC');

    if (agentId) {
      query.andWhere('payment.agentId = :agentId', { agentId });
    }

    if (startDate) {
      const start = new Date(startDate);
      query.andWhere('payment.paidAt >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('payment.paidAt <= :end', { end });
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      query.andWhere(
        '(payment.transactionId ILIKE :q OR profile.fullName ILIKE :q OR user.mobileNumber ILIKE :q OR earning.title ILIKE :q)',
        { q },
      );
    }

    const payments = await query.getMany();

    // Calculate aggregated analytics across all recorded payments
    const allPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.COMPLETED },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSpent = allPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const todaySpent = allPayments
      .filter((p) => new Date(p.paidAt) >= startOfToday)
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const thisWeekSpent = allPayments
      .filter((p) => new Date(p.paidAt) >= sevenDaysAgo)
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const thisMonthSpent = allPayments
      .filter((p) => new Date(p.paidAt) >= startOfMonth)
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);

    const data = payments.map((p) => ({
      id: p.id,
      agentId: p.agentId,
      agent: {
        id: p.agent ? p.agent.id : p.agentId,
        fullName: p.agent?.profile?.fullName || 'Agent Partner',
        mobileNumber: p.agent?.user?.mobileNumber || '',
      },
      earningId: p.earningId,
      earningTitle: p.earning ? p.earning.title : null,
      amount: Number(p.amount),
      transactionId: p.transactionId,
      paymentMethod: p.paymentMethod,
      status: p.status,
      paymentProofKey: p.paymentProofKey,
      previousPendingAmount: Number(p.previousPendingAmount || 0),
      remainingPendingAmount: Number(p.remainingPendingAmount || 0),
      notes: p.notes,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

    return {
      success: true,
      analytics: {
        totalSpent,
        todaySpent,
        thisWeekSpent,
        thisMonthSpent,
        totalTransactions: allPayments.length,
      },
      data,
    };
  }

  async reviewKyc(agentId: string, approve: boolean, rejectionReason?: string) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['kyc'],
    });
    if (!agent || !agent.kyc) throw new NotFoundException('Agent KYC record not found');

    const kyc = agent.kyc;
    kyc.status = approve ? KycStatus.APPROVED : KycStatus.REJECTED;
    kyc.rejectionReason = approve ? null : rejectionReason || 'KYC document verification failed';
    kyc.reviewedAt = new Date();
    await this.kycRepository.save(kyc);

    if (approve) {
      agent.status = AgentStatus.APPROVED;
      agent.approvedAt = new Date();
      agent.rejectionReason = null;
      await this.agentRepository.save(agent);
      this.wsGateway.emitToAgent(agentId, 'agent.status.updated', { status: 'APPROVED' });
      this.wsGateway.emitToAdmin('agent.status.updated', { agentId, status: 'APPROVED' });
    } else {
      agent.status = AgentStatus.REJECTED;
      agent.rejectionReason = kyc.rejectionReason;
      await this.agentRepository.save(agent);
      this.wsGateway.emitToAgent(agentId, 'agent.status.updated', { status: 'REJECTED', rejectionReason: kyc.rejectionReason });
      this.wsGateway.emitToAdmin('agent.status.updated', { agentId, status: 'REJECTED', rejectionReason: kyc.rejectionReason });
    }

    // Notify agent via WebSocket and Push Notifications
    const eventName = 'kyc.status.updated';
    const notifTitle = approve ? 'KYC Approved' : 'KYC Rejected';
    const notifMsg = approve
      ? 'Your identity documents have been verified.'
      : `KYC Rejected: ${kyc.rejectionReason}`;

    this.wsGateway.emitToAgent(agentId, eventName, { status: kyc.status, rejectionReason: kyc.rejectionReason });
    this.wsGateway.emitToAdmin(eventName, { agentId, status: kyc.status, rejectionReason: kyc.rejectionReason });
    await this.notificationsService.createNotification(agentId, notifTitle, notifMsg, approve ? 'KYC_APPROVED' : 'KYC_REJECTED');

    // Audit record
    await this.auditRepository.save({
      actorId: null,
      action: approve ? 'KYC_APPROVE' : 'KYC_REJECT',
      entityType: 'KYC_DOCUMENT',
      entityId: kyc.id,
      metadata: { agentId, rejectionReason: kyc.rejectionReason },
    });

    return { success: true, message: `KYC ${kyc.status}` };
  }

  async updateAgentStatus(agentId: string, status: AgentStatus, rejectionReason?: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    agent.status = status;
    if (status === AgentStatus.APPROVED) {
      agent.approvedAt = new Date();
      agent.rejectionReason = null;
    } else if (status === AgentStatus.REJECTED || status === AgentStatus.SUSPENDED) {
      agent.rejectionReason = rejectionReason || `Agent account ${status.toLowerCase()}`;
    }

    await this.agentRepository.save(agent);

    // Real-time broadcast
    this.wsGateway.emitToAgent(agentId, 'agent.status.updated', {
      status: agent.status,
      rejectionReason: agent.rejectionReason,
    });
    this.wsGateway.emitToAdmin('agent.status.updated', {
      agentId,
      status: agent.status,
      rejectionReason: agent.rejectionReason,
    });

    await this.notificationsService.createNotification(
      agentId,
      `Account Status: ${status}`,
      `Your account status has been updated to ${status}.`,
      `AGENT_${status}`,
    );

    // Audit log
    await this.auditRepository.save({
      actorId: null,
      action: `AGENT_STATUS_${status}`,
      entityType: 'AGENT',
      entityId: agentId,
      metadata: { status, rejectionReason: agent.rejectionReason },
    });

    return { success: true, message: `Agent status updated to ${status}` };
  }

  async reviewProperty(propertyId: string, approve: boolean, rejectionReason?: string, commissionAmount?: number) {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    if (commissionAmount !== undefined && commissionAmount !== null && !isNaN(Number(commissionAmount))) {
      property.commissionAmount = Number(commissionAmount);
    }

    property.status = approve ? PropertyStatus.APPROVED : PropertyStatus.REJECTED;
    property.rejectionReason = approve ? null : rejectionReason || 'Property details did not satisfy verification rules';
    property.reviewedAt = new Date();
    await this.propertyRepository.save(property);

    if (approve) {
      const rewardAmount = Number(property.commissionAmount || 0);

      // Check if an earning already exists for this property to prevent duplicates
      let earning = await this.earningRepository.findOne({ where: { propertyId: property.id } });
      if (!earning) {
        // Automatically create a PENDING commission reward for the agent
        earning = this.earningRepository.create({
          agentId: property.agentId,
          title: `Commission: ${property.title}`,
          amount: rewardAmount,
          propertyId: property.id,
          status: EarningStatus.PENDING,
          earnedDate: new Date(),
        });
      } else {
        earning.amount = rewardAmount;
        earning.title = `Commission: ${property.title}`;
        if (earning.status !== EarningStatus.PAID) {
          earning.status = EarningStatus.PENDING;
        }
      }
      const savedEarning = await this.earningRepository.save(earning);

      // Emit live WebSocket events
      this.wsGateway.emitToAgent(property.agentId, 'earning.created', {
        earningId: savedEarning.id,
        title: savedEarning.title,
        amount: savedEarning.amount,
        status: savedEarning.status,
        propertyTitle: property.title,
      });
      this.wsGateway.emitToAgent(property.agentId, 'earnings.updated', {
        agentId: property.agentId,
        amount: savedEarning.amount,
      });
      this.wsGateway.emitToAdmin('pending_payments.updated', {
        earningId: savedEarning.id,
        agentId: property.agentId,
        amount: savedEarning.amount,
      });
      this.wsGateway.emitToAdmin('credits.updated', {
        agentId: property.agentId,
      });

      await this.notificationsService.createNotification(
        property.agentId,
        'Commission Added (Pending Payment)',
        `₹${rewardAmount.toLocaleString('en-IN')} has been added to your pending payments for approved property "${property.title}".`,
        'EARNING_PENDING',
      );
    }

    this.wsGateway.emitToAgent(property.agentId, 'property.status.updated', {
      propertyId: property.id,
      status: property.status,
      rejectionReason: property.rejectionReason,
    });

    await this.notificationsService.createNotification(
      property.agentId,
      approve ? 'Property Approved!' : 'Property Listing Rejected',
      approve ? `Your property "${property.title}" is now active and approved.` : `Listing "${property.title}" rejected: ${property.rejectionReason}`,
      approve ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED',
    );

    return { success: true, message: `Property status updated to ${property.status}`, data: property };
  }

  async getPendingPayments(search?: string) {
    const query = this.earningRepository
      .createQueryBuilder('earning')
      .leftJoinAndSelect('earning.agent', 'agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .leftJoinAndSelect('earning.property', 'property')
      .where('earning.status = :status', { status: EarningStatus.PENDING })
      .orderBy('earning.earnedDate', 'DESC');

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(earning.title) LIKE :q OR LOWER(profile.fullName) LIKE :q OR user.mobileNumber LIKE :q OR LOWER(property.title) LIKE :q)',
        { q },
      );
    }

    const pendingEarnings = await query.getMany();
    const totalPendingAmount = pendingEarnings.reduce((sum, e) => sum + Number(e.amount), 0);

    const data = pendingEarnings.map((e) => ({
      id: e.id,
      agentId: e.agentId,
      agent: {
        id: e.agent?.id || e.agentId,
        fullName: e.agent?.profile?.fullName || 'Agent Partner',
        mobileNumber: e.agent?.user?.mobileNumber || '',
        areaLocation: e.agent?.profile?.areaLocation || '',
      },
      title: e.title,
      amount: Number(e.amount),
      status: e.status,
      earnedDate: e.earnedDate,
      propertyId: e.propertyId,
      propertyTitle: e.property?.title || null,
      propertyLocation: e.property?.location || null,
    }));

    return {
      success: true,
      totalPendingAmount,
      totalCount: pendingEarnings.length,
      data,
    };
  }

  async settlePendingPayment(
    earningId: string,
    transactionId: string,
    paymentMethod = 'UPI',
    paymentProofKey?: string,
  ) {
    const earning = await this.earningRepository.findOne({
      where: { id: earningId },
      relations: ['agent', 'agent.profile', 'agent.user'],
    });
    if (!earning) {
      throw new NotFoundException('Pending payment record not found');
    }

    if (earning.status === EarningStatus.PAID) {
      throw new BadRequestException('This payment has already been settled');
    }

    // 1. Mark earning as PAID
    earning.status = EarningStatus.PAID;
    await this.earningRepository.save(earning);

    // 2. Create the completed Payment record
    const payment = this.paymentRepository.create({
      agentId: earning.agentId,
      earningId: earning.id,
      amount: earning.amount,
      transactionId,
      paymentMethod,
      paymentProofKey,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // 3. Emit live WebSockets
    this.wsGateway.emitToAdmin('payment.created', {
      paymentId: savedPayment.id,
      earningId: earning.id,
      amount: savedPayment.amount,
      transactionId: savedPayment.transactionId,
      paymentMethod: savedPayment.paymentMethod,
    });
    this.wsGateway.emitToAdmin('pending_payments.updated', {
      settledEarningId: earning.id,
    });
    this.wsGateway.emitToAgent(earning.agentId, 'payment.created', {
      paymentId: savedPayment.id,
      earningId: earning.id,
      amount: savedPayment.amount,
      transactionId: savedPayment.transactionId,
      paymentMethod: savedPayment.paymentMethod,
      title: earning.title,
    });
    this.wsGateway.emitToAgent(earning.agentId, 'earnings.updated', {
      agentId: earning.agentId,
      amount: savedPayment.amount,
    });
    this.wsGateway.emitToAgent(earning.agentId, 'notification', {
      title: 'Pending Payment Settled & Disbursed! 🎉',
      message: `₹${Number(earning.amount).toLocaleString('en-IN')} for "${earning.title}" has been transferred to your account (Ref: ${transactionId}).`,
      type: 'PAYMENT_RECORDED',
    });

    await this.notificationsService.createNotification(
      earning.agentId,
      'Pending Payment Settled & Disbursed! 🎉',
      `₹${Number(earning.amount).toLocaleString('en-IN')} for "${earning.title}" has been transferred to your account (Ref: ${transactionId}).`,
      'PAYMENT_RECORDED',
    );

    return {
      success: true,
      message: `Pending payment for "${earning.title}" successfully settled!`,
      data: savedPayment,
    };
  }

  async createEarning(agentId: string, title: string, amount: number, propertyId?: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const earning = this.earningRepository.create({
      agentId,
      title,
      amount,
      propertyId,
      status: EarningStatus.CONFIRMED,
      earnedDate: new Date(),
    });

    const savedEarning = await this.earningRepository.save(earning);

    // Real-time WebSocket emission
    this.wsGateway.emitToAgent(agentId, 'earning.created', {
      earningId: savedEarning.id,
      title: savedEarning.title,
      amount: savedEarning.amount,
      status: savedEarning.status,
    });
    this.wsGateway.emitToAgent(agentId, 'earnings.updated', {
      agentId,
      amount: savedEarning.amount,
    });

    await this.notificationsService.createNotification(
      agentId,
      'New Earning Added',
      `You earned ₹${amount.toLocaleString('en-IN')} for "${title}".`,
      'EARNING_CREATED',
    );

    return { success: true, data: savedEarning };
  }

  async recordPayment(agentId: string, amount: number, transactionId: string, paymentMethod: string, earningId?: string, paymentProofKey?: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    let targetEarningId = earningId;
    if (!targetEarningId) {
      const earning = this.earningRepository.create({
        agentId,
        title: `Payout Disbursement (Ref: ${transactionId})`,
        amount,
        status: EarningStatus.PAID,
        earnedDate: new Date(),
      });
      const savedEarning = await this.earningRepository.save(earning);
      targetEarningId = savedEarning.id;
    } else {
      await this.earningRepository.update({ id: targetEarningId }, { status: EarningStatus.PAID });
    }

    const payment = this.paymentRepository.create({
      agentId,
      amount,
      transactionId,
      paymentMethod,
      paymentProofKey,
      earningId: targetEarningId,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Live real-time WebSocket broadcasts
    this.wsGateway.emitToAgent(agentId, 'payment.created', {
      paymentId: savedPayment.id,
      amount: savedPayment.amount,
      transactionId: savedPayment.transactionId,
      paymentMethod: savedPayment.paymentMethod,
    });
    this.wsGateway.emitToAgent(agentId, 'earnings.updated', {
      agentId,
      amount: savedPayment.amount,
    });
    this.wsGateway.emitToAgent(agentId, 'notification', {
      title: 'Payment Received!',
      message: `₹${amount.toLocaleString('en-IN')} has been transferred (Txn: ${transactionId}).`,
      type: 'PAYMENT_RECORDED',
    });

    await this.notificationsService.createNotification(
      agentId,
      'Payment Received!',
      `₹${amount.toLocaleString('en-IN')} has been transferred (Txn: ${transactionId}).`,
      'PAYMENT_RECORDED',
    );

    return { success: true, data: savedPayment };
  }

  async getAgentCreditSummary(search?: string) {
    const agents = await this.agentRepository.find({
      relations: ['profile', 'user', 'earnings', 'payments', 'properties'],
      order: { createdAt: 'DESC' },
    });

    let results = agents.map((agent) => {
      const allEarnings = agent.earnings || [];
      const allPayments = (agent.payments || []).filter((p) => p.status === PaymentStatus.COMPLETED);

      const rawCommission = allEarnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pendingAmount = Math.max(0, rawCommission - totalPaid);
      const totalCommission = Math.max(rawCommission, totalPaid + pendingAmount);

      const approvedPropertiesCount = (agent.properties || []).filter((p) => p.status === PropertyStatus.APPROVED).length;

      // Find last payment date
      const sortedPayments = [...allPayments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
      const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].paidAt : null;

      return {
        agentId: agent.id,
        fullName: agent.profile?.fullName || 'Agent Partner',
        mobileNumber: agent.user?.mobileNumber || '',
        areaLocation: agent.profile?.areaLocation || '',
        status: agent.status,
        totalCommission,
        totalPaid,
        pendingAmount,
        approvedPropertiesCount,
        lastPaymentDate,
        pendingEarningsCount: allEarnings.filter((e) => e.status === EarningStatus.PENDING).length,
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (a) =>
          a.agentId.toLowerCase().includes(q) ||
          a.fullName.toLowerCase().includes(q) ||
          a.mobileNumber.toLowerCase().includes(q) ||
          a.areaLocation.toLowerCase().includes(q),
      );
    }

    const totalSystemCommission = results.reduce((sum, a) => sum + a.totalCommission, 0);
    const totalSystemPaid = results.reduce((sum, a) => sum + a.totalPaid, 0);
    const totalSystemPending = results.reduce((sum, a) => sum + a.pendingAmount, 0);

    return {
      success: true,
      summary: {
        totalCommission: totalSystemCommission,
        totalPaid: totalSystemPaid,
        totalPending: totalSystemPending,
        totalAgents: results.length,
      },
      data: results,
    };
  }

  async payAgent(
    agentId: string,
    amount: number,
    paymentMethod = 'UPI',
    transactionId?: string,
    notes?: string,
    paymentProofKey?: string,
  ) {
    const payAmount = Number(amount);
    if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['profile', 'user', 'earnings', 'payments'],
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const allEarnings = agent.earnings || [];
    const allCompletedPayments = (agent.payments || []).filter((p) => p.status === PaymentStatus.COMPLETED);

    const totalCommission = allEarnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalPaid = allCompletedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const previousPending = Math.max(0, totalCommission - totalPaid);

    if (payAmount > previousPending) {
      throw new BadRequestException(
        `Payment amount (₹${payAmount}) cannot exceed agent's current pending balance (₹${previousPending}).`,
      );
    }

    const remainingPending = Math.max(0, previousPending - payAmount);
    const finalTxnId = transactionId && transactionId.trim() ? transactionId.trim() : `TXN${Date.now()}`;

    // 1. FIFO Allocation across pending earnings
    // Query all PENDING earnings ordered by oldest earnedDate / createdAt
    const pendingEarnings = await this.earningRepository.find({
      where: { agentId, status: EarningStatus.PENDING },
      relations: ['payments'],
      order: { earnedDate: 'ASC', createdAt: 'ASC' },
    });

    let remainingToAllocate = payAmount;
    const affectedEarningIds: string[] = [];

    for (const earning of pendingEarnings) {
      if (remainingToAllocate <= 0) break;
      const earningAmount = Number(earning.amount || 0);

      // Find how much has already been paid specifically towards this earning
      const alreadyPaidForEarning = (earning.payments || [])
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const earningRemaining = Math.max(0, earningAmount - alreadyPaidForEarning);
      if (earningRemaining <= 0) {
        earning.status = EarningStatus.PAID;
        await this.earningRepository.save(earning);
        continue;
      }

      if (remainingToAllocate >= earningRemaining) {
        // Fully clear this earning
        earning.status = EarningStatus.PAID;
        await this.earningRepository.save(earning);
        remainingToAllocate -= earningRemaining;
        affectedEarningIds.push(earning.id);
      } else {
        // Partially paid - remains PENDING until completely paid off
        remainingToAllocate = 0;
        affectedEarningIds.push(earning.id);
      }
    }

    // 2. Create the completed Payment transaction record
    const payment = this.paymentRepository.create({
      agentId,
      earningId: affectedEarningIds.length > 0 ? affectedEarningIds[0] : null,
      amount: payAmount,
      transactionId: finalTxnId,
      paymentMethod,
      paymentProofKey,
      previousPendingAmount: previousPending,
      remainingPendingAmount: remainingPending,
      notes: notes || `Disbursed to ${agent.profile?.fullName || 'Agent'}`,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // 3. Emit live WebSockets
    this.wsGateway.emitToAdmin('payment.created', {
      paymentId: savedPayment.id,
      agentId,
      amount: savedPayment.amount,
      transactionId: savedPayment.transactionId,
      paymentMethod: savedPayment.paymentMethod,
      previousPendingAmount: previousPending,
      remainingPendingAmount: remainingPending,
    });
    this.wsGateway.emitToAdmin('pending_payments.updated', { agentId });
    this.wsGateway.emitToAdmin('credits.updated', { agentId });

    this.wsGateway.emitToAgent(agentId, 'payment.created', {
      paymentId: savedPayment.id,
      amount: savedPayment.amount,
      transactionId: savedPayment.transactionId,
      paymentMethod: savedPayment.paymentMethod,
      previousPendingAmount: previousPending,
      remainingPendingAmount: remainingPending,
    });
    this.wsGateway.emitToAgent(agentId, 'earnings.updated', {
      agentId,
      amount: savedPayment.amount,
      previousPending,
      remainingPending,
    });

    const agentName = agent.profile?.fullName || 'Agent Partner';
    const notifMsg = `Payment of ₹${payAmount.toLocaleString('en-IN')} via ${paymentMethod} received. Previous Pending: ₹${previousPending.toLocaleString('en-IN')}, Remaining Pending: ₹${remainingPending.toLocaleString('en-IN')}. (Txn: ${finalTxnId})`;

    await this.notificationsService.createNotification(
      agentId,
      'Payment Disbursed! 🎉',
      notifMsg,
      'PAYMENT_RECORDED',
    );

    return {
      success: true,
      message: `Payment of ₹${payAmount} successfully processed for ${agentName}!`,
      data: {
        payment: savedPayment,
        agent: {
          id: agent.id,
          fullName: agentName,
          totalCommission,
          totalPaid: totalPaid + payAmount,
          pendingAmount: remainingPending,
        },
      },
    };
  }

  async deletePayment(paymentId: string) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    const agentId = payment.agentId;
    const amount = payment.amount;
    const earningId = payment.earningId;
    const txnId = payment.transactionId;

    // Delete the payment record
    await this.paymentRepository.delete({ id: paymentId });

    // Also delete the linked earning record if it exists
    if (earningId) {
      try {
        await this.earningRepository.delete({ id: earningId });
      } catch (_) {}
    }

    if (txnId) {
      try {
        await this.earningRepository
          .createQueryBuilder()
          .delete()
          .from(EarningEntity)
          .where('title LIKE :q', { q: `%${txnId}%` })
          .execute();
      } catch (_) {}
    }

    // Broadcast live WebSocket event to admin and agent
    this.wsGateway.emitToAdmin('payment.deleted', {
      paymentId,
      agentId,
      amount,
    });
    if (agentId) {
      this.wsGateway.emitToAgent(agentId, 'payment.deleted', {
        paymentId,
        amount,
      });
      this.wsGateway.emitToAgent(agentId, 'earnings.updated', {
        agentId,
      });
      this.wsGateway.emitToAgent(agentId, 'notification', {
        title: 'Transaction Updated',
        message: `A payment transaction of ₹${Number(amount).toLocaleString('en-IN')} was removed.`,
        type: 'PAYMENT_DELETED',
      });
    }

    return {
      success: true,
      message: 'Transaction deleted successfully',
      data: { paymentId },
    };
  }

  async deleteAgent(agentId: string) {
    const agent = await this.agentRepository.findOne({
      where: [{ id: agentId }, { userId: agentId }],
      relations: ['profile', 'kyc', 'bankAccount', 'user', 'properties'],
    });
    if (!agent) {
      this.wsGateway.emitToAdmin('agent.deleted', { agentId });
      return { success: true, message: 'Agent deleted successfully' };
    }

    const realAgentId = agent.id;
    const userId = agent.userId;

    // 1. Delete property images & properties
    const props = await this.propertyRepository.find({ where: { agentId: realAgentId } });
    for (const p of props) {
      await this.imageRepository.delete({ propertyId: p.id });
    }
    await this.propertyRepository.delete({ agentId: realAgentId });

    // 2. Delete earnings & payments
    await this.earningRepository.delete({ agentId: realAgentId });
    await this.paymentRepository.delete({ agentId: realAgentId });

    // 3. Delete KYC & Bank & Profile
    await this.kycRepository.delete({ agentId: realAgentId });
    await this.bankRepository.delete({ agentId: realAgentId });
    await this.profileRepository.delete({ agentId: realAgentId });
    await this.ticketRepository.delete({ agentId: realAgentId });

    // 4. Delete Agent & User
    await this.agentRepository.delete({ id: realAgentId });
    if (userId) {
      await this.userRepository.delete({ id: userId });
    }

    this.wsGateway.emitToAdmin('agent.deleted', { agentId: realAgentId });
    return { success: true, message: 'Agent deleted successfully' };
  }

  async updateAgent(agentId: string, data: any) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['profile', 'user'],
    });
    if (!agent) throw new NotFoundException('Agent not found');

    if (data.status) {
      agent.status = data.status;
      if (data.rejectionReason !== undefined) agent.rejectionReason = data.rejectionReason;
      await this.agentRepository.save(agent);
    }

    if (!agent.profile) {
      agent.profile = this.profileRepository.create({ agentId });
    }
    if (data.fullName) agent.profile.fullName = data.fullName;
    if (data.areaLocation) agent.profile.areaLocation = data.areaLocation;
    if (data.workPlatform) agent.profile.workPlatform = data.workPlatform;
    if (data.age) agent.profile.age = Number(data.age);
    if (data.gender) agent.profile.gender = data.gender;
    if (data.profilePhotoUrl) agent.profile.profilePhotoUrl = data.profilePhotoUrl;
    await this.profileRepository.save(agent.profile);

    if (agent.user && data.mobileNumber) {
      agent.user.mobileNumber = data.mobileNumber;
      await this.userRepository.save(agent.user);
    }

    this.wsGateway.emitToAdmin('agent.updated', { agentId });
    this.wsGateway.emitToAgent(agentId, 'agent.updated', { agentId });
    return { success: true, message: 'Agent updated successfully' };
  }

  async deleteKyc(agentId: string) {
    const agent = await this.agentRepository.findOne({
      where: [{ id: agentId }, { userId: agentId }],
    });
    const realAgentId = agent ? agent.id : agentId;
    await this.kycRepository.delete({ agentId: realAgentId });
    this.wsGateway.emitToAdmin('kyc.status.updated', { agentId: realAgentId, status: 'NOT_SUBMITTED' });
    this.wsGateway.emitToAgent(realAgentId, 'kyc.status.updated', { status: 'NOT_SUBMITTED' });
    return { success: true, message: 'KYC submission reset successfully' };
  }

  async updateKyc(agentId: string, data: any) {
    let kyc = await this.kycRepository.findOne({ where: { agentId } });
    if (!kyc) {
      kyc = this.kycRepository.create({ agentId });
    }

    if (data.aadhaarNumber) {
      const cleanAadhaar = data.aadhaarNumber.toString().replace(/\D/g, '');
      kyc.aadhaarNumberEncrypted = CryptoUtil.encrypt(cleanAadhaar);
      kyc.aadhaarLast4 = cleanAadhaar.slice(-4);
    }
    if (data.panNumber) {
      const cleanPan = data.panNumber.toString().trim().toUpperCase();
      kyc.panNumberEncrypted = CryptoUtil.encrypt(cleanPan);
      kyc.panMasked = `${cleanPan.substring(0, 5)}****${cleanPan.slice(-1)}`;
    }
    if (data.aadhaarDocKey) kyc.aadhaarDocKey = data.aadhaarDocKey;
    if (data.panDocKey) kyc.panDocKey = data.panDocKey;
    if (data.status) {
      kyc.status = data.status;
      if (data.rejectionReason !== undefined) kyc.rejectionReason = data.rejectionReason;
    }
    await this.kycRepository.save(kyc);

    let bank = await this.bankRepository.findOne({ where: { agentId } });
    if (!bank) {
      bank = this.bankRepository.create({ agentId });
    }
    if (data.bankAccountNumber) {
      const cleanAcc = data.bankAccountNumber.toString().replace(/\s+/g, '');
      bank.accountNumberEncrypted = CryptoUtil.encrypt(cleanAcc);
      bank.accountLast4 = cleanAcc.slice(-4);
    }
    if (data.bankIfscCode) bank.ifscCode = data.bankIfscCode.toString().trim().toUpperCase();
    if (data.bankUpiId) bank.upiId = data.bankUpiId.toString().trim();
    if (data.bankPhonepeNumber) bank.phonepeNumber = data.bankPhonepeNumber;
    await this.bankRepository.save(bank);

    this.wsGateway.emitToAdmin('kyc.status.updated', { agentId, status: kyc.status });
    this.wsGateway.emitToAgent(agentId, 'kyc.status.updated', { status: kyc.status });
    return { success: true, message: 'KYC details updated successfully' };
  }

  async deleteProperty(propertyId: string) {
    const prop = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!prop) throw new NotFoundException('Property not found');

    const agentId = prop.agentId;
    await this.imageRepository.delete({ propertyId });
    await this.propertyRepository.delete({ id: propertyId });

    // Also delete any pending listing earning associated
    try {
      await this.earningRepository
        .createQueryBuilder()
        .delete()
        .from(EarningEntity)
        .where('propertyId = :propertyId OR title LIKE :t', { propertyId, t: `%${prop.title}%` })
        .execute();
    } catch (_) {}

    this.wsGateway.emitToAdmin('property.deleted', { propertyId, agentId });
    if (agentId) {
      this.wsGateway.emitToAgent(agentId, 'property.deleted', { propertyId });
      this.wsGateway.emitToAgent(agentId, 'earnings.updated', { agentId });
    }
    return { success: true, message: 'Property listing deleted successfully' };
  }

  async updateProperty(propertyId: string, data: any) {
    const prop = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!prop) throw new NotFoundException('Property not found');

    if (data.title) prop.title = data.title;
    if (data.description) prop.description = data.description;
    if (data.price !== undefined) prop.price = data.price;
    if (data.category) prop.category = data.category;
    if (data.status) prop.status = data.status;
    if (data.rejectionReason !== undefined) prop.rejectionReason = data.rejectionReason;
    if (data.locationAddress || data.locationCity || data.location) {
      prop.location = [data.locationAddress, data.locationCity].filter(Boolean).join(', ') || data.location || prop.location;
    }
    if (data.specifications) prop.specifications = data.specifications;

    await this.propertyRepository.save(prop);

    if (data.newImageKeys && Array.isArray(data.newImageKeys) && data.newImageKeys.length > 0) {
      if (data.replaceImages) {
        await this.imageRepository.delete({ propertyId });
      }
      for (let i = 0; i < data.newImageKeys.length; i++) {
        const imgKey = data.newImageKeys[i];
        const newImg = this.imageRepository.create({
          propertyId,
          imageKey: imgKey,
          isPrimary: i === 0,
          displayOrder: i,
        });
        await this.imageRepository.save(newImg);
      }
    }

    this.wsGateway.emitToAdmin('property.updated', { propertyId, status: prop.status });
    if (prop.agentId) {
      this.wsGateway.emitToAgent(prop.agentId, 'property.updated', { propertyId, status: prop.status });
    }
    return { success: true, message: 'Property listing updated successfully', data: prop };
  }

  async deleteEarning(earningId: string) {
    const earning = await this.earningRepository.findOne({ where: { id: earningId } });
    if (!earning) throw new NotFoundException('Earning record not found');

    const agentId = earning.agentId;
    await this.earningRepository.delete({ id: earningId });

    this.wsGateway.emitToAdmin('earnings.updated', { agentId });
    this.wsGateway.emitToAdmin('pending_payments.updated', { agentId });
    if (agentId) {
      this.wsGateway.emitToAgent(agentId, 'earnings.updated', { agentId });
    }
    return { success: true, message: 'Earning record deleted successfully' };
  }

  async deleteTicket(ticketId: string) {
    await this.ticketRepository.delete({ id: ticketId });
    this.wsGateway.emitToAdmin('ticket.deleted', { ticketId });
    return { success: true, message: 'Support ticket deleted successfully' };
  }

  // ==========================================
  // AGENT PERFORMANCE & TRANSACTIONS ENGINE
  // ==========================================

  async getAgentPerformanceSummary(search?: string, status?: string) {
    const query = this.agentRepository
      .createQueryBuilder('agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .leftJoinAndSelect('agent.properties', 'properties')
      .leftJoinAndSelect('agent.earnings', 'earnings')
      .leftJoinAndSelect('agent.payments', 'payments')
      .orderBy('agent.createdAt', 'DESC');

    if (status && status !== 'ALL') {
      query.andWhere('agent.status = :status', { status });
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.fullName) LIKE :q OR user.mobileNumber LIKE :q OR LOWER(profile.areaLocation) LIKE :q OR LOWER(agent.id) LIKE :q)',
        { q },
      );
    }

    const agents = await query.getMany();

    const results = agents.map((agent) => {
      const allProperties = agent.properties || [];
      const approvedProperties = allProperties.filter((p) => p.status === PropertyStatus.APPROVED);
      const allEarnings = agent.earnings || [];
      const completedPayments = (agent.payments || []).filter((p) => p.status === PaymentStatus.COMPLETED);

      const totalListings = allProperties.length;
      const approvedListings = approvedProperties.length;
      const rawCommission = allEarnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pendingAmount = Math.max(0, rawCommission - totalPaid);
      const totalCommission = Math.max(rawCommission, totalPaid + pendingAmount);
      const successfulTransactions = completedPayments.length;

      // Find last transaction timestamp
      const sortedPayments = [...completedPayments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
      const lastTransactionAt = sortedPayments.length > 0 ? sortedPayments[0].paidAt : null;

      return {
        agentId: agent.id,
        agentName: agent.profile?.fullName || 'Agent Partner',
        mobileNumber: agent.user?.mobileNumber || '',
        areaLocation: agent.profile?.areaLocation || '',
        status: agent.status,
        joinedAt: agent.createdAt,
        totalListings,
        approvedListings,
        totalCommission,
        totalPaid,
        pendingAmount,
        successfulTransactions,
        lastTransactionAt,
      };
    });

    const totalSystemListings = results.reduce((sum, a) => sum + a.totalListings, 0);
    const totalSystemApprovedListings = results.reduce((sum, a) => sum + a.approvedListings, 0);
    const totalSystemCommission = results.reduce((sum, a) => sum + a.totalCommission, 0);
    const totalSystemPaid = results.reduce((sum, a) => sum + a.totalPaid, 0);
    const totalSystemPending = results.reduce((sum, a) => sum + a.pendingAmount, 0);
    const totalSystemTransactions = results.reduce((sum, a) => sum + a.successfulTransactions, 0);

    return {
      success: true,
      summary: {
        totalAgents: results.length,
        totalListings: totalSystemListings,
        approvedListings: totalSystemApprovedListings,
        totalCommission: totalSystemCommission,
        totalPaid: totalSystemPaid,
        pendingAmount: totalSystemPending,
        successfulTransactions: totalSystemTransactions,
      },
      data: results,
    };
  }

  async getSuccessfulTransactions(search?: string, startDate?: string, endDate?: string, agentId?: string) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.agent', 'agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .leftJoinAndSelect('payment.earning', 'earning')
      .leftJoinAndSelect('earning.property', 'property')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .orderBy('payment.paidAt', 'DESC');

    if (agentId && agentId.trim()) {
      query.andWhere('payment.agentId = :agentId', { agentId });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('payment.paidAt >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('payment.paidAt <= :end', { end });
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(payment.transactionId) LIKE :q OR LOWER(profile.fullName) LIKE :q OR user.mobileNumber LIKE :q OR LOWER(property.title) LIKE :q OR LOWER(payment.paymentMethod) LIKE :q)',
        { q },
      );
    }

    const payments = await query.getMany();

    const results = await Promise.all(
      payments.map(async (p) => {
        let proofUrl = null;
        if (p.paymentProofKey) {
          try {
            proofUrl = await this.uploadsService.getPresignedReadUrl(BucketType.PAYMENT, p.paymentProofKey);
          } catch (_) {}
        }

        return {
          id: p.id,
          transactionId: p.transactionId,
          agentId: p.agentId,
          agentName: p.agent?.profile?.fullName || 'Agent Partner',
          mobileNumber: p.agent?.user?.mobileNumber || '',
          amount: Number(p.amount),
          paymentMethod: p.paymentMethod,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
          status: 'Successful',
          previousPendingAmount: p.previousPendingAmount !== null && p.previousPendingAmount !== undefined ? Number(p.previousPendingAmount) : null,
          remainingPendingAmount: p.remainingPendingAmount !== null && p.remainingPendingAmount !== undefined ? Number(p.remainingPendingAmount) : null,
          notes: p.notes || null,
          relatedProperty: p.earning?.property ? {
            id: p.earning.property.id,
            title: p.earning.property.title,
            location: p.earning.property.location,
          } : null,
          earningTitle: p.earning ? p.earning.title : 'Agent Commission Settlement',
          paymentProofUrl: proofUrl,
        };
      }),
    );

    const totalAmountCredited = results.reduce((sum, p) => sum + p.amount, 0);

    return {
      success: true,
      totalTransactions: results.length,
      totalAmountCredited,
      data: results,
    };
  }

  async getAgentPerformanceDetails(agentId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['profile', 'user', 'bankAccount', 'kyc', 'properties', 'properties.images', 'earnings', 'earnings.property', 'payments', 'payments.earning', 'payments.earning.property'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const allProperties = agent.properties || [];
    const approvedProperties = allProperties.filter((p) => p.status === PropertyStatus.APPROVED);
    const allEarnings = agent.earnings || [];
    const completedPayments = (agent.payments || []).filter((p) => p.status === PaymentStatus.COMPLETED);

    const totalListings = allProperties.length;
    const approvedListings = approvedProperties.length;
    const rawCommission = allEarnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingAmount = Math.max(0, rawCommission - totalPaid);
    const totalCommission = Math.max(rawCommission, totalPaid + pendingAmount);
    const successfulTransactions = completedPayments.length;

    // Format all listings
    const sortedProperties = [...allProperties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const listings = await Promise.all(
      sortedProperties.map(async (prop) => {
        let primaryImageUrl = null;
        const primaryImg = (prop.images || []).find((i) => i.isPrimary) || (prop.images || [])[0];
        if (primaryImg) {
          try {
            primaryImageUrl = await this.uploadsService.getPresignedReadUrl(BucketType.PROPERTY, primaryImg.imageKey);
          } catch (_) {}
        }

        return {
          id: prop.id,
          title: prop.title,
          category: prop.category,
          price: Number(prop.price),
          commissionAmount: Number(prop.commissionAmount || 0),
          location: prop.location,
          status: prop.status,
          rejectionReason: prop.rejectionReason,
          createdAt: prop.createdAt,
          submittedAt: prop.submittedAt,
          reviewedAt: prop.reviewedAt,
          primaryImageUrl,
        };
      }),
    );

    // Format all payments
    const sortedPayments = [...completedPayments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    const payments = await Promise.all(
      sortedPayments.map(async (p) => {
        let proofUrl = null;
        if (p.paymentProofKey) {
          try {
            proofUrl = await this.uploadsService.getPresignedReadUrl(BucketType.PAYMENT, p.paymentProofKey);
          } catch (_) {}
        }

        return {
          id: p.id,
          transactionId: p.transactionId,
          amount: Number(p.amount),
          paymentMethod: p.paymentMethod,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
          status: 'Successful',
          previousPendingAmount: p.previousPendingAmount !== null && p.previousPendingAmount !== undefined ? Number(p.previousPendingAmount) : null,
          remainingPendingAmount: p.remainingPendingAmount !== null && p.remainingPendingAmount !== undefined ? Number(p.remainingPendingAmount) : null,
          notes: p.notes || null,
          relatedProperty: p.earning?.property ? {
            id: p.earning.property.id,
            title: p.earning.property.title,
            location: p.earning.property.location,
          } : null,
          earningTitle: p.earning ? p.earning.title : 'Agent Commission Settlement',
          paymentProofUrl: proofUrl,
        };
      }),
    );

    return {
      success: true,
      agent: {
        id: agent.id,
        fullName: agent.profile?.fullName || 'Agent Partner',
        mobileNumber: agent.user?.mobileNumber || '',
        areaLocation: agent.profile?.areaLocation || '',
        workPlatform: agent.profile?.workPlatform || '',
        status: agent.status,
        joinedAt: agent.createdAt,
        approvedAt: agent.approvedAt,
        bankAccount: agent.bankAccount ? {
          accountNumber: agent.bankAccount.accountLast4 ? `••••${agent.bankAccount.accountLast4}` : null,
          ifscCode: agent.bankAccount.ifscCode,
          upiId: agent.bankAccount.upiId,
          phonepeNumber: agent.bankAccount.phonepeNumber,
          isVerified: agent.bankAccount.isVerified,
        } : null,
        kycStatus: agent.kyc?.status || 'NOT_SUBMITTED',
      },
      summary: {
        totalListings,
        approvedListings,
        totalCommission,
        totalPaid,
        pendingAmount,
        successfulTransactions,
      },
      listings,
      payments,
    };
  }
}
