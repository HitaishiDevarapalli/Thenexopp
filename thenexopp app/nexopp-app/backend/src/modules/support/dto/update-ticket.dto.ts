import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../../database/entities/support-ticket.entity';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  resolution?: string;
}
