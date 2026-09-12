import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Agent Profile')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current agent profile and onboarding status' })
  async getProfile(@Req() req: any) {
    return this.agentsService.getProfile(req.user.sub);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update agent profile details' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.agentsService.updateProfile(req.user.sub, dto);
  }
}
