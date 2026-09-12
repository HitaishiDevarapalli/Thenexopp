import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminIntegrationService } from './admin-integration.service';
import { AgentStatus } from '../../database/entities/agent.entity';
import { PropertyStatus } from '../../database/entities/property.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';

class ReviewKycDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  approve: boolean;

  @ApiProperty({ example: 'Documents verified successfully', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

class UpdateAgentStatusDto {
  @ApiProperty({ enum: AgentStatus, example: AgentStatus.APPROVED })
  @IsNotEmpty()
  @IsEnum(AgentStatus)
  status: AgentStatus;

  @ApiProperty({ example: 'Approved by admin', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

class ReviewPropertyDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  approve: boolean;

  @ApiProperty({ example: 'Verified property listing', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsNumber()
  commissionAmount?: number;
}

class PayAgentDto {
  @ApiProperty({ example: 'uuid-agent-id' })
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @ApiProperty({ example: 30 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'UPI' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ example: 'Partial payout clearance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'payment-proof-key.jpg', required: false })
  @IsOptional()
  @IsString()
  paymentProofKey?: string;
}

class CreateEarningDto {
  @ApiProperty({ example: 'uuid-agent-id' })
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @ApiProperty({ example: 'Property Listing Commission' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'uuid-property-id', required: false })
  @IsOptional()
  @IsString()
  propertyId?: string;
}

class RecordPaymentDto {
  @ApiProperty({ example: 'uuid-agent-id' })
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'UPI123456789' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'UPI' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'uuid-earning-id', required: false })
  @IsOptional()
  @IsString()
  earningId?: string;

  @ApiProperty({ example: 'payment-proof-key.jpg', required: false })
  @IsOptional()
  @IsString()
  paymentProofKey?: string;
}

class SettlePendingPaymentDto {
  @ApiProperty({ example: 'UTR123456789' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'UPI', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ example: 'payment-proof-key.jpg', required: false })
  @IsOptional()
  @IsString()
  paymentProofKey?: string;
}

@ApiTags('Admin Integration')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminIntegrationController {
  constructor(private readonly adminService: AdminIntegrationService) {}

  @Get('agents')
  @ApiOperation({ summary: 'List all agents with performance metrics' })
  @ApiQuery({ name: 'status', enum: AgentStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllAgents(
    @Query('status') status?: AgentStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllAgents(status, search);
  }

  @Get('agents/credits')
  @ApiOperation({ summary: 'Get agent-wise commission and pending credit summary' })
  @ApiQuery({ name: 'search', required: false })
  async getAgentCreditSummary(@Query('search') search?: string) {
    return this.adminService.getAgentCreditSummary(search);
  }

  @Post('pay-agent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disburse payment to agent with FIFO pending commission deduction' })
  async payAgent(@Body() body: PayAgentDto) {
    return this.adminService.payAgent(
      body.agentId,
      body.amount,
      body.paymentMethod,
      body.transactionId,
      body.notes,
      body.paymentProofKey,
    );
  }

  @Get('properties')
  @ApiOperation({ summary: 'List all properties day-wise with agent details and pictures' })
  @ApiQuery({ name: 'status', enum: PropertyStatus, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllProperties(
    @Query('status') status?: PropertyStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllProperties(status, startDate, endDate, agentId, search);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payment records and financial analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getPaymentRecords(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getPaymentRecords(startDate, endDate, agentId, search);
  }

  @Get('pending-payments')
  @ApiOperation({ summary: 'List all pending payments requiring admin review and settlement' })
  @ApiQuery({ name: 'search', required: false })
  async getPendingPayments(@Query('search') search?: string) {
    return this.adminService.getPendingPayments(search);
  }

  @Post('pending-payments/:id/settle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Settle and disburse a pending payment' })
  async settlePendingPayment(@Param('id') earningId: string, @Body() body: SettlePendingPaymentDto) {
    return this.adminService.settlePendingPayment(
      earningId,
      body.transactionId,
      body.paymentMethod || 'UPI',
      body.paymentProofKey,
    );
  }

  @Put('agents/:id/kyc')
  @ApiOperation({ summary: 'Approve or Reject agent KYC' })
  async reviewKyc(@Param('id') agentId: string, @Body() body: ReviewKycDto) {
    return this.adminService.reviewKyc(agentId, body.approve, body.rejectionReason);
  }

  @Put('agents/:id/status')
  @ApiOperation({ summary: 'Approve, Reject, or Suspend Agent Account' })
  async updateAgentStatus(@Param('id') agentId: string, @Body() body: UpdateAgentStatusDto) {
    return this.adminService.updateAgentStatus(agentId, body.status, body.rejectionReason);
  }

  @Put('properties/:id/review')
  @ApiOperation({ summary: 'Approve or Reject property listing with commission' })
  async reviewProperty(@Param('id') propertyId: string, @Body() body: ReviewPropertyDto) {
    return this.adminService.reviewProperty(propertyId, body.approve, body.rejectionReason, body.commissionAmount);
  }

  @Post('earnings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create earning record for agent' })
  async createEarning(@Body() body: CreateEarningDto) {
    return this.adminService.createEarning(body.agentId, body.title, body.amount, body.propertyId);
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record payment transaction and payment proof' })
  async recordPayment(@Body() body: RecordPaymentDto) {
    return this.adminService.recordPayment(
      body.agentId,
      body.amount,
      body.transactionId,
      body.paymentMethod,
      body.earningId,
      body.paymentProofKey,
    );
  }

  @Delete('payments/:id')
  @ApiOperation({ summary: 'Delete a payment transaction record' })
  async deletePayment(@Param('id') paymentId: string) {
    return this.adminService.deletePayment(paymentId);
  }

  @Delete('agents/:id')
  @ApiOperation({ summary: 'Delete an agent and all related records' })
  async deleteAgent(@Param('id') agentId: string) {
    return this.adminService.deleteAgent(agentId);
  }

  @Put('agents/:id')
  @ApiOperation({ summary: 'Update agent profile details' })
  async updateAgent(@Param('id') agentId: string, @Body() body: any) {
    return this.adminService.updateAgent(agentId, body);
  }

  @Delete('kyc/:agentId')
  @ApiOperation({ summary: 'Delete or reset KYC submission for agent' })
  async deleteKyc(@Param('agentId') agentId: string) {
    return this.adminService.deleteKyc(agentId);
  }

  @Put('kyc/:agentId')
  @ApiOperation({ summary: 'Update KYC and banking details for agent' })
  async updateKyc(@Param('agentId') agentId: string, @Body() body: any) {
    return this.adminService.updateKyc(agentId, body);
  }

  @Delete('properties/:id')
  @ApiOperation({ summary: 'Delete property listing' })
  async deleteProperty(@Param('id') propertyId: string) {
    return this.adminService.deleteProperty(propertyId);
  }

  @Put('properties/:id')
  @ApiOperation({ summary: 'Update property listing details' })
  async updateProperty(@Param('id') propertyId: string, @Body() body: any) {
    return this.adminService.updateProperty(propertyId, body);
  }

  @Delete('earnings/:id')
  @ApiOperation({ summary: 'Delete earning record' })
  async deleteEarning(@Param('id') earningId: string) {
    return this.adminService.deleteEarning(earningId);
  }

  @Delete('pending-payments/:id')
  @ApiOperation({ summary: 'Delete / Cancel pending payment' })
  async deletePendingPayment(@Param('id') earningId: string) {
    return this.adminService.deleteEarning(earningId);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete support ticket' })
  async deleteTicket(@Param('id') ticketId: string) {
    return this.adminService.deleteTicket(ticketId);
  }

  // ==========================================
  // AGENT PERFORMANCE & TRANSACTIONS ENDPOINTS
  // ==========================================

  @Get('performance/summary')
  @ApiOperation({ summary: 'Get complete agent performance summary and metrics' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getPerformanceSummary(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAgentPerformanceSummary(search, status);
  }

  @Get('performance/transactions')
  @ApiOperation({ summary: 'Get permanent successful transactions ledger' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  async getSuccessfulTransactions(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.adminService.getSuccessfulTransactions(search, startDate, endDate, agentId);
  }

  @Get('performance/agents/:id')
  @ApiOperation({ summary: 'Get full agent performance profile with all listings and payments' })
  async getAgentPerformanceDetails(@Param('id') agentId: string) {
    return this.adminService.getAgentPerformanceDetails(agentId);
  }
}
