import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import {
  SupportTicketEntity,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../database/entities/support-ticket.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AgentWebSocketGateway } from '../websocket/agent-websocket.gateway';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectRepository(SupportTicketEntity)
    private readonly ticketRepository: Repository<SupportTicketEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly wsGateway: AgentWebSocketGateway,
  ) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['profile', 'user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    // Generate unique sequential ticket ID e.g. TKT-748921
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const ticketNumber = `TKT-${randomCode}`;

    const ticket = this.ticketRepository.create({
      ticketNumber,
      agentId: agent.id,
      category: dto.category,
      subject: dto.subject,
      description: dto.description,
      priority: dto.priority || TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Real-time broadcast to Admin Portal
    this.wsGateway.emitToAdmin('ticket.created', {
      id: savedTicket.id,
      ticketNumber: savedTicket.ticketNumber,
      agentId: agent.id,
      agentName: agent.profile?.fullName || 'Agent Partner',
      mobileNumber: agent.user?.mobileNumber || '',
      subject: savedTicket.subject,
      category: savedTicket.category,
      priority: savedTicket.priority,
      status: savedTicket.status,
      createdAt: savedTicket.createdAt,
    });

    return {
      success: true,
      message: 'Support ticket raised successfully',
      data: savedTicket,
    };
  }

  async getMyTickets(userId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    const tickets = await this.ticketRepository.find({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: tickets,
    };
  }

  async getAllTicketsAdmin(filters?: {
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    search?: string;
  }) {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.agent', 'agent')
      .leftJoinAndSelect('agent.profile', 'profile')
      .leftJoinAndSelect('agent.user', 'user')
      .orderBy('ticket.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('ticket.category = :category', { category: filters.category });
    }

    if (filters?.priority) {
      query.andWhere('ticket.priority = :priority', { priority: filters.priority });
    }

    if (filters?.search) {
      const q = `%${filters.search.trim()}%`;
      query.andWhere(
        '(ticket.ticketNumber ILIKE :q OR ticket.subject ILIKE :q OR ticket.description ILIKE :q OR profile.fullName ILIKE :q OR user.mobileNumber ILIKE :q)',
        { q },
      );
    }

    const tickets = await query.getMany();

    // Calculate live analytics
    const totalCount = await this.ticketRepository.count();
    const openCount = await this.ticketRepository.count({ where: { status: TicketStatus.OPEN } });
    const inProgressCount = await this.ticketRepository.count({ where: { status: TicketStatus.IN_PROGRESS } });
    const resolvedCount = await this.ticketRepository.count({ where: { status: TicketStatus.RESOLVED } });

    const formatted = tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      category: t.category,
      subject: t.subject,
      description: t.description,
      priority: t.priority,
      status: t.status,
      resolution: t.resolution,
      resolvedAt: t.resolvedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      agent: {
        id: t.agent?.id,
        fullName: t.agent?.profile?.fullName || 'Agent Partner',
        mobileNumber: t.agent?.user?.mobileNumber || '',
        areaLocation: t.agent?.profile?.areaLocation || 'N/A',
        workPlatform: t.agent?.profile?.workPlatform || 'Individual',
        status: t.agent?.status,
      },
    }));

    return {
      success: true,
      data: formatted,
      analytics: {
        total: totalCount,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
    };
  }

  async updateTicketAdmin(ticketId: string, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['agent'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (dto.status) {
      ticket.status = dto.status;
      if (dto.status === TicketStatus.RESOLVED || dto.status === TicketStatus.CLOSED) {
        ticket.resolvedAt = new Date();
      }
    }

    if (dto.priority) {
      ticket.priority = dto.priority;
    }

    if (dto.resolution !== undefined) {
      ticket.resolution = dto.resolution;
    }

    const updated = await this.ticketRepository.save(ticket);

    // Notify agent via socket
    this.wsGateway.emitToAgent(ticket.agentId, 'ticket.updated', {
      ticketId: updated.id,
      ticketNumber: updated.ticketNumber,
      status: updated.status,
      resolution: updated.resolution,
      resolvedAt: updated.resolvedAt,
    });

    // Notify admin portal
    this.wsGateway.emitToAdmin('ticket.updated', {
      ticketId: updated.id,
      status: updated.status,
    });

    return {
      success: true,
      message: 'Ticket updated successfully',
      data: updated,
    };
  }
}
