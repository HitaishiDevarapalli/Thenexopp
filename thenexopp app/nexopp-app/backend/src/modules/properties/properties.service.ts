import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity, PropertyStatus } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { AgentEntity, AgentStatus } from '../../database/entities/agent.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UploadsService, BucketType } from '../uploads/uploads.service';
import { AgentWebSocketGateway } from '../websocket/agent-websocket.gateway';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(PropertyImageEntity)
    private readonly imageRepository: Repository<PropertyImageEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly uploadsService: UploadsService,
    private readonly wsGateway: AgentWebSocketGateway,
  ) {}

  async getPropertiesForAgent(userId: string, status?: PropertyStatus) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent record not found');

    const whereCondition: any = { agentId: agent.id };
    if (status) {
      whereCondition.status = status;
    }

    const properties = await this.propertyRepository.find({
      where: whereCondition,
      relations: ['images'],
      order: { createdAt: 'DESC' },
    });

    // Populate presigned view URLs for images
    const result = await Promise.all(
      properties.map(async (prop) => {
        const imagesWithUrls = await Promise.all(
          (prop.images || []).map(async (img) => ({
            id: img.id,
            imageKey: img.imageKey,
            isPrimary: img.isPrimary,
            url: await this.uploadsService.getPresignedReadUrl(BucketType.PROPERTY, img.imageKey),
          })),
        );

        return {
          id: prop.id,
          title: prop.title,
          description: prop.description,
          price: Number(prop.price),
          commissionAmount: Number(prop.commissionAmount || 0),
          category: prop.category,
          specifications: prop.specifications,
          location: prop.location,
          status: prop.status,
          rejectionReason: prop.rejectionReason,
          submittedAt: prop.submittedAt,
          reviewedAt: prop.reviewedAt,
          createdAt: prop.createdAt,
          updatedAt: prop.updatedAt,
          images: imagesWithUrls,
        };
      }),
    );

    return {
      success: true,
      data: result,
    };
  }

  async getPropertyById(userId: string, propertyId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent record not found');

    const prop = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['images', 'verifications'],
    });

    if (!prop) throw new NotFoundException('Property not found');
    if (prop.agentId !== agent.id) throw new ForbiddenException('Access denied to this property');

    const imagesWithUrls = await Promise.all(
      (prop.images || []).map(async (img) => ({
        id: img.id,
        imageKey: img.imageKey,
        isPrimary: img.isPrimary,
        url: await this.uploadsService.getPresignedReadUrl(BucketType.PROPERTY, img.imageKey),
      })),
    );

    return {
      success: true,
      data: {
        id: prop.id,
        title: prop.title,
        description: prop.description,
        price: Number(prop.price),
        commissionAmount: Number(prop.commissionAmount || 0),
        category: prop.category,
        specifications: prop.specifications,
        location: prop.location,
        status: prop.status,
        rejectionReason: prop.rejectionReason,
        submittedAt: prop.submittedAt,
        reviewedAt: prop.reviewedAt,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        images: imagesWithUrls,
        verifications: prop.verifications || [],
      },
    };
  }

  async createProperty(userId: string, dto: CreatePropertyDto) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent record not found');
    if (agent.status === AgentStatus.SUSPENDED || agent.status === AgentStatus.REJECTED) {
      throw new ForbiddenException(`Agent account is ${agent.status.toLowerCase()}. Cannot submit properties.`);
    }

    const initialStatus = dto.isDraft ? PropertyStatus.DRAFT : PropertyStatus.SUBMITTED;
    const submittedAt = dto.isDraft ? null : new Date();

    const property = this.propertyRepository.create({
      agentId: agent.id,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      commissionAmount: dto.commissionAmount || 0,
      category: dto.category,
      specifications: dto.specifications || {},
      location: dto.location,
      status: initialStatus,
      submittedAt,
    });

    const savedProperty = await this.propertyRepository.save(property);

    if (dto.imageKeys && dto.imageKeys.length > 0) {
      const imageEntities = dto.imageKeys.map((key, index) =>
        this.imageRepository.create({
          propertyId: savedProperty.id,
          imageKey: key,
          isPrimary: index === 0,
          displayOrder: index,
        }),
      );
      await this.imageRepository.save(imageEntities);
    }

    // Real-time broadcast to Admin Portal
    this.wsGateway.emitToAdmin('property.status.updated', {
      propertyId: savedProperty.id,
      agentId: agent.id,
      status: savedProperty.status,
    });

    return this.getPropertyById(userId, savedProperty.id);
  }

  async submitProperty(userId: string, propertyId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    const prop = await this.propertyRepository.findOne({ where: { id: propertyId } });

    if (!prop) throw new NotFoundException('Property not found');
    if (prop.agentId !== agent.id) throw new ForbiddenException('Access denied');

    prop.status = PropertyStatus.SUBMITTED;
    prop.submittedAt = new Date();
    await this.propertyRepository.save(prop);

    // Real-time broadcast to Admin Portal
    this.wsGateway.emitToAdmin('property.status.updated', {
      propertyId: prop.id,
      agentId: agent.id,
      status: prop.status,
    });

    return this.getPropertyById(userId, propertyId);
  }
}
