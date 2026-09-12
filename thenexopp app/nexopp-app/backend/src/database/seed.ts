import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { UserEntity, UserRole } from './entities/user.entity';
import { AgentEntity, AgentStatus } from './entities/agent.entity';
import { AgentProfileEntity } from './entities/agent-profile.entity';
import { KycDocumentEntity, KycStatus } from './entities/kyc-document.entity';
import { BankAccountEntity } from './entities/bank-account.entity';
import { PropertyEntity, PropertyStatus, PropertyCategory } from './entities/property.entity';
import { PropertyImageEntity } from './entities/property-image.entity';
import { PropertyVerificationEntity } from './entities/property-verification.entity';
import { EarningEntity, EarningStatus } from './entities/earning.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { NotificationEntity } from './entities/notification.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { SupportTicketEntity, TicketStatus, TicketPriority, TicketCategory } from './entities/support-ticket.entity';
import { CryptoUtil } from '../common/utils/crypto.util';

const entities = [
  UserEntity,
  AgentEntity,
  AgentProfileEntity,
  KycDocumentEntity,
  BankAccountEntity,
  PropertyEntity,
  PropertyImageEntity,
  PropertyVerificationEntity,
  EarningEntity,
  PaymentEntity,
  NotificationEntity,
  RefreshTokenEntity,
  AuditLogEntity,
  SupportTicketEntity,
];

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'thenexopp_agent_dev.sqlite',
  entities,
  synchronize: true,
});

async function runSeed() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Database connected.');

  const userRepo = AppDataSource.getRepository(UserEntity);
  const agentRepo = AppDataSource.getRepository(AgentEntity);
  const profileRepo = AppDataSource.getRepository(AgentProfileEntity);
  const kycRepo = AppDataSource.getRepository(KycDocumentEntity);
  const bankRepo = AppDataSource.getRepository(BankAccountEntity);
  const propRepo = AppDataSource.getRepository(PropertyEntity);
  const imgRepo = AppDataSource.getRepository(PropertyImageEntity);
  const earnRepo = AppDataSource.getRepository(EarningEntity);
  const payRepo = AppDataSource.getRepository(PaymentEntity);
  const ticketRepo = AppDataSource.getRepository(SupportTicketEntity);
  const notifRepo = AppDataSource.getRepository(NotificationEntity);

  const existingAgents = await agentRepo.count();
  if (existingAgents > 0) {
    console.log(`Database already has ${existingAgents} agents. Seed already populated.`);
    await AppDataSource.destroy();
    return;
  }

  console.log('Seeding initial data...');

  // 1. Admin User
  let adminUser = await userRepo.findOne({ where: { role: UserRole.ADMIN } });
  if (!adminUser) {
    adminUser = userRepo.create({
      mobileNumber: '9876543210',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepo.save(adminUser);
    console.log('Created Admin user');
  }

  // 2. Demo Agent 1 (Approved Agent - Suresh Kumar)
  const user1 = await userRepo.save(
    userRepo.create({
      mobileNumber: '9988776655',
      role: UserRole.AGENT,
      isActive: true,
    })
  );

  const agent1 = await agentRepo.save(
    agentRepo.create({
      userId: user1.id,
      status: AgentStatus.APPROVED,
    })
  );

  await profileRepo.save(
    profileRepo.create({
      agentId: agent1.id,
      fullName: 'Suresh Kumar',
      areaLocation: 'Indiranagar, Bangalore',
      workPlatform: 'Swiggy / Zomato Rider',
      age: 28,
      gender: 'Male',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    })
  );

  await kycRepo.save(
    kycRepo.create({
      agentId: agent1.id,
      aadhaarNumberEncrypted: CryptoUtil.encrypt('548912345678'),
      aadhaarLast4: '5678',
      aadhaarDocKey: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      panNumberEncrypted: CryptoUtil.encrypt('ABCDE1234F'),
      panMasked: 'XXXXX1234F',
      panDocKey: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      status: KycStatus.APPROVED,
    })
  );

  await bankRepo.save(
    bankRepo.create({
      agentId: agent1.id,
      accountNumberEncrypted: CryptoUtil.encrypt('9123456789012'),
      accountLast4: '9012',
      ifscCode: 'HDFC0001234',
      upiId: 'sureshkumar@okhdfcbank',
      phonepeNumber: '9988776655',
      isVerified: true,
    })
  );

  // Agent 1 Properties
  const prop1 = await propRepo.save(
    propRepo.create({
      agentId: agent1.id,
      title: '2 BHK Luxury Apartment with Balcony',
      description: 'Spacious 2BHK apartment with modern amenities, wooden flooring, modular kitchen, and scenic view.',
      category: PropertyCategory.RESIDENTIAL_SALE,
      price: 6500000,
      commissionAmount: 500,
      location: '12th Main, 100ft Road, Indiranagar, Bangalore',
      status: PropertyStatus.APPROVED,
      specifications: {
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1250,
        furnishingStatus: 'Semi-Furnished',
        ownerName: 'Ramesh Gupta',
        ownerMobile: '9845012345',
        city: 'Bangalore',
        pincode: '560038',
      },
    })
  );

  await imgRepo.save([
    imgRepo.create({
      propertyId: prop1.id,
      imageKey: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      isPrimary: true,
      displayOrder: 1,
    }),
    imgRepo.create({
      propertyId: prop1.id,
      imageKey: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      isPrimary: false,
      displayOrder: 2,
    }),
  ]);

  const prop2 = await propRepo.save(
    propRepo.create({
      agentId: agent1.id,
      title: 'Commercial Retail Shop on Ground Floor',
      description: 'High footfall retail shop located near Indiranagar Metro Station. Ideal for boutique, clinic or cafe.',
      category: PropertyCategory.COMMERCIAL_RENT,
      price: 45000,
      commissionAmount: 300,
      location: 'CMH Road, Indiranagar, Bangalore',
      status: PropertyStatus.SUBMITTED,
      specifications: {
        areaSqFt: 480,
        ownerName: 'Anita Sharma',
        ownerMobile: '9740123890',
        city: 'Bangalore',
        pincode: '560038',
      },
    })
  );

  await imgRepo.save([
    imgRepo.create({
      propertyId: prop2.id,
      imageKey: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      isPrimary: true,
      displayOrder: 1,
    }),
  ]);

  const earn1 = await earnRepo.save(
    earnRepo.create({
      agentId: agent1.id,
      propertyId: prop1.id,
      title: 'Commission for 2 BHK Apartment',
      amount: 500,
      status: EarningStatus.PAID,
      earnedDate: new Date(),
    })
  );

  await earnRepo.save(
    earnRepo.create({
      agentId: agent1.id,
      propertyId: prop2.id,
      title: 'Commission for Commercial Shop',
      amount: 300,
      status: EarningStatus.PENDING,
      earnedDate: new Date(),
    })
  );

  await payRepo.save(
    payRepo.create({
      agentId: agent1.id,
      earningId: earn1.id,
      amount: 500,
      paymentMethod: 'UPI',
      transactionId: 'UPI-TXN-9847291823',
      status: PaymentStatus.COMPLETED,
      paymentProofKey: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    })
  );

  // 3. Demo Agent 2 (Pending Approval - Ramesh Patel)
  const user2 = await userRepo.save(
    userRepo.create({
      mobileNumber: '9822334455',
      role: UserRole.AGENT,
      isActive: true,
    })
  );

  const agent2 = await agentRepo.save(
    agentRepo.create({
      userId: user2.id,
      status: AgentStatus.PENDING_APPROVAL,
    })
  );

  await profileRepo.save(
    profileRepo.create({
      agentId: agent2.id,
      fullName: 'Ramesh Patel',
      areaLocation: 'Koramangala, Bangalore',
      workPlatform: 'Dunzo Delivery Partner',
      age: 26,
      gender: 'Male',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    })
  );

  await kycRepo.save(
    kycRepo.create({
      agentId: agent2.id,
      aadhaarNumberEncrypted: CryptoUtil.encrypt('887766554433'),
      aadhaarLast4: '4433',
      aadhaarDocKey: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      panNumberEncrypted: CryptoUtil.encrypt('PQRST5678G'),
      panMasked: 'XXXXX5678G',
      panDocKey: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      status: KycStatus.UNDER_REVIEW,
    })
  );

  await bankRepo.save(
    bankRepo.create({
      agentId: agent2.id,
      accountNumberEncrypted: CryptoUtil.encrypt('112233445566'),
      accountLast4: '5566',
      ifscCode: 'SBIN0004567',
      upiId: 'rameshpatel@oksbi',
      phonepeNumber: '9822334455',
      isVerified: false,
    })
  );

  // 4. Demo Agent 3 (Pooja Reddy - Approved with listings)
  const user3 = await userRepo.save(
    userRepo.create({
      mobileNumber: '9123456780',
      role: UserRole.AGENT,
      isActive: true,
    })
  );

  const agent3 = await agentRepo.save(
    agentRepo.create({
      userId: user3.id,
      status: AgentStatus.APPROVED,
    })
  );

  await profileRepo.save(
    profileRepo.create({
      agentId: agent3.id,
      fullName: 'Pooja Reddy',
      areaLocation: 'HSR Layout, Bangalore',
      workPlatform: 'Urban Company Partner',
      age: 25,
      gender: 'Female',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    })
  );

  await kycRepo.save(
    kycRepo.create({
      agentId: agent3.id,
      aadhaarNumberEncrypted: CryptoUtil.encrypt('332211445566'),
      aadhaarLast4: '5566',
      panNumberEncrypted: CryptoUtil.encrypt('WXYZR9012K'),
      panMasked: 'XXXXX9012K',
      status: KycStatus.APPROVED,
    })
  );

  await bankRepo.save(
    bankRepo.create({
      agentId: agent3.id,
      accountNumberEncrypted: CryptoUtil.encrypt('778899001122'),
      accountLast4: '1122',
      ifscCode: 'ICIC0002345',
      upiId: 'poojareddy@okicici',
      phonepeNumber: '9123456780',
      isVerified: true,
    })
  );

  const prop3 = await propRepo.save(
    propRepo.create({
      agentId: agent3.id,
      title: '3 BHK Villa with Private Garden',
      description: 'Gated community villa with clubhouse, private garden, 2 covered car parkings.',
      category: PropertyCategory.RESIDENTIAL_SALE,
      price: 18000000,
      commissionAmount: 1000,
      location: 'Sector 2, HSR Layout, Bangalore',
      status: PropertyStatus.APPROVED,
      specifications: {
        bedrooms: 3,
        bathrooms: 3,
        areaSqFt: 2400,
        furnishingStatus: 'Fully-Furnished',
        ownerName: 'Vikram Seth',
        ownerMobile: '9845099887',
        city: 'Bangalore',
        pincode: '560102',
      },
    })
  );

  await imgRepo.save([
    imgRepo.create({
      propertyId: prop3.id,
      imageKey: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      isPrimary: true,
      displayOrder: 1,
    }),
  ]);

  await earnRepo.save(
    earnRepo.create({
      agentId: agent3.id,
      propertyId: prop3.id,
      title: 'Commission for 3 BHK Villa',
      amount: 1000,
      status: EarningStatus.PENDING,
      earnedDate: new Date(),
    })
  );

  // Tickets
  await ticketRepo.save([
    ticketRepo.create({
      ticketNumber: 'TKT-1001',
      agentId: agent1.id,
      subject: 'Payout settlement query for Indiranagar listing',
      description: 'Hi Admin team, when will the latest commission of ₹300 be disbursed to my UPI ID?',
      category: TicketCategory.PAYMENTS,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    }),
    ticketRepo.create({
      ticketNumber: 'TKT-1002',
      agentId: agent2.id,
      subject: 'KYC Document verification timeline',
      description: 'Submitted Aadhaar and PAN documents yesterday. Please review soon.',
      category: TicketCategory.KYC,
      priority: TicketPriority.LOW,
      status: TicketStatus.IN_PROGRESS,
    }),
  ]);

  // Notifications
  await notifRepo.save([
    notifRepo.create({
      agentId: agent1.id,
      title: 'Property Approved!',
      message: 'Your listing "2 BHK Luxury Apartment" has been approved and reward of ₹500 credited.',
      type: 'PROPERTY_APPROVED',
      isRead: false,
    }),
    notifRepo.create({
      agentId: agent3.id,
      title: 'Welcome to TheNexopp Agent Network',
      message: 'Your agent profile and KYC have been verified successfully.',
      type: 'WELCOME',
      isRead: true,
    }),
  ]);

  console.log('✅ Seed data successfully inserted!');
  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
