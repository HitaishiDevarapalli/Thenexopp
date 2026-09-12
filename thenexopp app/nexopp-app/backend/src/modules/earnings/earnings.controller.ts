import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Earnings')
@Controller('earnings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  @ApiOperation({ summary: 'Get agent financial summary and earnings ledger' })
  async getEarningsSummary(@Req() req: any) {
    return this.earningsService.getEarningsSummary(req.user.sub);
  }
}
