import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { TicketCategory, TicketPriority } from '../../../database/entities/support-ticket.entity';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
