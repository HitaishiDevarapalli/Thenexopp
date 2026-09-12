import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payment records and receipts' })
  async getPayments(@Req() req: any) {
    return this.paymentsService.getPaymentsForAgent(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment record details and proof by ID' })
  async getPaymentById(@Req() req: any, @Param('id') id: string) {
    return this.paymentsService.getPaymentById(req.user.sub, id);
  }
}
