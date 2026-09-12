import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyStatus } from '../../database/entities/property.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agent properties filtered by optional status' })
  @ApiQuery({ name: 'status', enum: PropertyStatus, required: false })
  async getProperties(@Req() req: any, @Query('status') status?: PropertyStatus) {
    return this.propertiesService.getPropertiesForAgent(req.user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details by ID' })
  async getPropertyById(@Req() req: any, @Param('id') id: string) {
    return this.propertiesService.getPropertyById(req.user.sub, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new property listing (Draft or Submitted)' })
  async createProperty(@Req() req: any, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.createProperty(req.user.sub, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft property for review' })
  async submitProperty(@Req() req: any, @Param('id') id: string) {
    return this.propertiesService.submitProperty(req.user.sub, id);
  }
}
