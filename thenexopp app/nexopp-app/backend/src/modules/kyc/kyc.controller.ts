import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Agent KYC')
@Controller('agent/kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @ApiOperation({ summary: 'Get agent KYC status and masked details' })
  async getKyc(@Req() req: any) {
    return this.kycService.getKycDetails(req.user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit sensitive KYC documents and details' })
  async submitKyc(@Req() req: any, @Body() dto: SubmitKycDto) {
    return this.kycService.submitKyc(req.user.sub, dto);
  }
}
