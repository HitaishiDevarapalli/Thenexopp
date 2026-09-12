import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubmitBankDetailsDto {
  @ApiProperty({ example: '918234567890' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
  @Matches(/^\d{9,18}$/, { message: 'Bank account number must be between 9 and 18 digits' })
  accountNumber: string;

  @ApiProperty({ example: '918234567890' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
  confirmAccountNumber: string;

  @ApiProperty({ example: 'SBIN0001234' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(/^[A-Za-z0-9]{11}$/, { message: 'IFSC Code must be 11 characters (e.g. SBIN0001234)' })
  ifscCode: string;

  @ApiProperty({ example: 'rajesh@upi' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[\w.-]+@[\w.-]+$/, { message: 'UPI ID format must be valid (e.g. username@bank)' })
  upiId: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phonepeNumber?: string;
}
