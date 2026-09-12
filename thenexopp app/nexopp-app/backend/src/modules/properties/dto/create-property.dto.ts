import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { PropertyCategory } from '../../../database/entities/property.entity';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Commercial Office Space in Koramangala' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Prime 2000 sq.ft office space with 24/7 power backup and basement parking.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 45000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60.00, description: 'Agent commission amount for this property', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number;

  @ApiProperty({ enum: PropertyCategory, example: PropertyCategory.COMMERCIAL_RENT })
  @IsNotEmpty()
  @IsEnum(PropertyCategory)
  category: PropertyCategory;

  @ApiProperty({ example: { bedrooms: 3, areaSqFt: 1800, parking: true }, required: false })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({ example: 'Koramangala 5th Block, Bengaluru' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: ['property-image-1.jpg', 'property-image-2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  imageKeys: string[];

  @ApiProperty({ example: false, description: 'True to save as draft, False to submit for review' })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
