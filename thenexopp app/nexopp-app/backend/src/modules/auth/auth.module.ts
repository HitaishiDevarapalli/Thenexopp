import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserEntity } from '../../database/entities/user.entity';
import { AgentEntity } from '../../database/entities/agent.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { OtpService } from './otp/otp.service';
import { DevelopmentOtpProvider } from './otp/development-otp.provider';
import { Msg91OtpProvider } from './otp/msg91-otp.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AgentEntity, RefreshTokenEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    OtpService,
    DevelopmentOtpProvider,
    Msg91OtpProvider,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
