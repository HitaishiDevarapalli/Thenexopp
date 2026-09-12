import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../../database/entities/user.entity';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { OtpService } from './otp/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.mobileNumber);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.otpService.verifyOtp(dto.mobileNumber, dto.otp);

    // Find or create User
    let user = await this.userRepository.findOne({
      where: { mobileNumber: dto.mobileNumber },
      relations: ['agent', 'agent.profile', 'agent.kyc', 'agent.bankAccount'],
    });

    if (!user) {
      user = this.userRepository.create({
        mobileNumber: dto.mobileNumber,
        role: UserRole.AGENT,
        isActive: true,
      });
      user = await this.userRepository.save(user);

      // Initialize Agent Entity in NEW status
      const agent = this.agentRepository.create({
        userId: user.id,
        status: AgentStatus.NEW,
      });
      user.agent = await this.agentRepository.save(agent);
    } else if (!user.agent) {
      const agent = this.agentRepository.create({
        userId: user.id,
        status: AgentStatus.NEW,
      });
      user.agent = await this.agentRepository.save(agent);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    // Determine state
    const agentState = user.agent ? user.agent.status : AgentStatus.NEW;

    // Issue Tokens
    const payload = {
      sub: user.id,
      agentId: user.agent ? user.agent.id : null,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'tnx_access_secret_super_secure_key_987654321_2026_prod'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: refreshTokenHash,
      deviceInfo: dto.deviceId || 'mobile_app',
      expiresAt,
      revoked: false,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshTokenRaw,
        agentState,
        user: {
          id: user.id,
          agentId: user.agent ? user.agent.id : null,
          mobileNumber: user.mobileNumber,
          role: user.role,
          status: agentState,
        },
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revoked: false },
      relations: ['user', 'user.agent'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account inactive');
    }

    // Revoke old token
    tokenRecord.revoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Issue new access and refresh tokens
    const payload = {
      sub: user.id,
      agentId: user.agent ? user.agent.id : null,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'tnx_access_secret_super_secure_key_987654321_2026_prod'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const newRefreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshTokenRaw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      deviceInfo: tokenRecord.deviceInfo,
      expiresAt,
      revoked: false,
    });

    return {
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenRaw,
        agentState: user.agent ? user.agent.status : AgentStatus.NEW,
      },
    };
  }

  async adminLogin(username: string, password: string) {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'thenexopp_admin_2026');

    if (username.trim() !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Invalid Admin Username or Password');
    }

    // Find or create Admin User entity
    let user = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!user) {
      user = this.userRepository.create({
        mobileNumber: '9876543210',
        role: UserRole.ADMIN,
        isActive: true,
      });
      user = await this.userRepository.save(user);
    }

    const payload = {
      sub: user.id,
      role: UserRole.ADMIN,
      username: adminUsername,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'tnx_access_secret_super_secure_key_987654321_2026_prod'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
    });

    return {
      success: true,
      message: 'Admin login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          username: adminUsername,
          role: UserRole.ADMIN,
        },
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.refreshTokenRepository.update({ tokenHash }, { revoked: true });
    } else {
      await this.refreshTokenRepository.update({ userId }, { revoked: true });
    }
    return { success: true, message: 'Logged out successfully' };
  }
}
