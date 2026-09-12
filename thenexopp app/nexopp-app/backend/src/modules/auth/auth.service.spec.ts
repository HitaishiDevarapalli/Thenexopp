import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserEntity } from '../../database/entities/user.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { OtpService } from './otp/otp.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAgentRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockOtpService = {
    sendOtp: jest.fn().mockResolvedValue({ success: true, cooldownSeconds: 60 }),
    verifyOtp: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_access_token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepository },
        { provide: getRepositoryToken(AgentEntity), useValue: mockAgentRepository },
        { provide: getRepositoryToken(RefreshTokenEntity), useValue: mockRefreshTokenRepository },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should trigger sendOtp via OtpService', async () => {
    const result = await service.sendOtp({ mobileNumber: '9876543210' });
    expect(mockOtpService.sendOtp).toHaveBeenCalledWith('9876543210');
    expect(result.success).toBe(true);
  });
});
