import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

const apiServiceInfo = () => ({
  status: 'online',
  service: 'TheNexopp Agent Mobile Application REST API Gateway',
  version: '1.0.0',
  documentation: 'https://thenexopp.com/api/docs',
  websocket: 'wss://thenexopp.com/ws',
  endpoints: {
    auth: '/api/v1/auth',
    agentProfile: '/api/v1/agent/profile',
    kyc: '/api/v1/agent/kyc',
    bank: '/api/v1/agent/bank-details',
    properties: '/api/v1/properties',
    earnings: '/api/v1/earnings',
    payments: '/api/v1/payments',
    support: '/api/v1/support/tickets',
  },
  timestamp: new Date().toISOString(),
});

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Agent API Health & Service Index' })
  getRoot() {
    return apiServiceInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

@ApiTags('System')
@Controller('api/v1')
export class ApiV1Controller {
  @Get()
  @ApiOperation({ summary: 'Agent API Health & Service Index (Explicit v1)' })
  getRoot() {
    return apiServiceInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

