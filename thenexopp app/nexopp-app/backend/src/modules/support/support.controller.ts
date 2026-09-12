import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../database/entities/support-ticket.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Support Tickets')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Agent Routes
  @Post('support/tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Raise a new support ticket (Agent)' })
  async createTicket(@Req() req: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.sub, dto);
  }

  @Get('support/tickets')
  @ApiOperation({ summary: 'Get all support tickets raised by agent' })
  async getMyTickets(@Req() req: any) {
    return this.supportService.getMyTickets(req.user.sub);
  }

  // Admin Routes
  @Get('admin/tickets')
  @ApiOperation({ summary: 'List all support tickets with filters (Admin)' })
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiQuery({ name: 'category', enum: TicketCategory, required: false })
  @ApiQuery({ name: 'priority', enum: TicketPriority, required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllTicketsAdmin(
    @Query('status') status?: TicketStatus,
    @Query('category') category?: TicketCategory,
    @Query('priority') priority?: TicketPriority,
    @Query('search') search?: string,
  ) {
    return this.supportService.getAllTicketsAdmin({ status, category, priority, search });
  }

  @Patch('admin/tickets/:id')
  @ApiOperation({ summary: 'Update support ticket status or resolution (Admin)' })
  async updateTicketAdmin(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportService.updateTicketAdmin(id, dto);
  }
}
