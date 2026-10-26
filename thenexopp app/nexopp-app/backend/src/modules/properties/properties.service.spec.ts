import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesService } from './properties.service';
import { PropertyCategory, PropertyStatus } from '../../database/entities/property.entity';
import { AgentStatus } from '../../database/entities/agent.entity';

describe('Property submissions from mobile clients', () => {
  const area = 'SVN Colony';
  const addressDetails = 'SVN Colony, Guntur, Andhra Pradesh';
  const payload = {
    title: 'Residential listing',
    description: 'Property with an uploaded street photo',
    price: 15000,
    category: PropertyCategory.RESIDENTIAL_RENT,
    location: 'Guntur, Andhra Pradesh',
    specifications: { bhk: '2 BHK', areaSqFt: '1200' },
    imageKeys: ['uploaded-street-photo.jpg'],
    isDraft: false,
  };

  // Exercise the same strict validation as the production API. Disabling the
  // whitelist would hide the contract mismatch and accept unrelated fields.
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const validate = (body: unknown): Promise<CreatePropertyDto> =>
    pipe.transform(body, { type: 'body', metatype: CreatePropertyDto });

  async function submit(dto: CreatePropertyDto) {
    const properties = {
      create: jest.fn((property) => property),
      save: jest.fn(async (property) => ({ ...property, id: 'property-1' })),
      findOne: jest.fn(async () => ({
        id: 'property-1', agentId: 'agent-1',
        specifications: properties.create.mock.calls[0][0].specifications,
        images: [{ id: 'image-1', imageKey: payload.imageKeys[0], isPrimary: true }],
      })),
    };
    const images = {
      create: jest.fn((image) => image),
      save: jest.fn(async (items) => items),
    };
    const agents = { findOne: jest.fn(async () => ({ id: 'agent-1', status: AgentStatus.APPROVED })) };
    const uploads = { getPresignedReadUrl: jest.fn(async () => 'https://example.test/photo.jpg') };
    const gateway = { emitToAdmin: jest.fn() };
    const service = new PropertiesService(properties as any, images as any, agents as any, uploads as any, gateway as any);
    const result = await service.createProperty('user-1', dto);
    expect(properties.create).toHaveBeenCalledWith(expect.objectContaining({
      specifications: { ...payload.specifications, area, addressDetails },
      status: PropertyStatus.SUBMITTED,
    }));
    expect(images.save).toHaveBeenCalledWith([{
      propertyId: 'property-1', imageKey: 'uploaded-street-photo.jpg', isPrimary: true, displayOrder: 0,
    }]);
    expect(result.data.specifications).toEqual({ ...payload.specifications, area, addressDetails });
    expect(result.data.images[0].url).toBe('https://example.test/photo.jpg');
  }

  it('accepts the installed app payload from the reported validation error and retains its photo', async () => {
    await submit(await validate({ ...payload, area, addressDetails }));
  });

  it('accepts the updated app payload with address metadata in specifications', async () => {
    await submit(await validate({ ...payload, specifications: { ...payload.specifications, area, addressDetails } }));
  });

  it('continues to reject unexpected top-level fields', async () => {
    await expect(validate({ ...payload, unexpectedField: true })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not make address fields mandatory for existing integrations', async () => {
    await expect(validate(payload)).resolves.toMatchObject(payload);
  });
});
