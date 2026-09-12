import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankService } from './bank.service';
import { SubmitBankDetailsDto } from './dto/submit-bank-details.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bank & UPI')
@Controller('agent/bank-details')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiOperation({ summary: 'Get masked bank and UPI account details' })
  async getBankDetails(@Req() req: any) {
    return this.bankService.getBankDetails(req.user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit bank account and UPI details' })
  async submitBankDetails(@Req() req: any, @Body() dto: SubmitBankDetailsDto) {
    return this.bankService.submitBankDetails(req.user.sub, dto);
  }
}
