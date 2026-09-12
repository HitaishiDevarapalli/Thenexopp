export type AgentStatus =
  | 'NEW'
  | 'PROFILE_INCOMPLETE'
  | 'KYC_INCOMPLETE'
  | 'BANK_DETAILS_INCOMPLETE'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type KycStatus = 'NOT_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type PropertyStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type EarningStatus = 'PENDING' | 'PAID';
export type PaymentStatus = 'IN_TRANSIT' | 'COMPLETED' | 'FAILED';

export interface AgentSummary {
  id: string;
  userId: string;
  mobileNumber: string | null;
  status: AgentStatus;
  rejectionReason: string | null;
  fullName: string | null;
  profilePhotoUrl?: string | null;
  areaLocation: string | null;
  workPlatform: string | null;
  age?: number | null;
  gender?: string | null;
  kycStatus: KycStatus;
  aadhaarLast4?: string | null;
  panMasked?: string | null;
  aadhaarFullNumber?: string | null;
  panFullNumber?: string | null;
  aadhaarDocKey?: string | null;
  panDocKey?: string | null;
  aadhaarDocUrl?: string | null;
  panDocUrl?: string | null;
  bankAccountLast4?: string | null;
  bankAccountFullNumber?: string | null;
  bankIfscCode?: string | null;
  bankUpiId?: string | null;
  bankPhonepeNumber?: string | null;
  submittedAt: string;
  createdAt?: string;
  totalListings?: number;
  totalProperties?: number;
  acceptedListings?: number;
  approvedProperties?: number;
  rejectedListings?: number;
  pendingListings?: number;
  totalPaid?: number;
  pendingEarnings?: number;
}

export interface PropertyImage {
  id: string;
  imageKey: string;
  isPrimary: boolean;
  displayOrder: number;
  url: string | null;
}

export interface PropertyAgent {
  id: string;
  fullName: string;
  mobileNumber: string;
  areaLocation?: string;
  workPlatform?: string;
}

export interface PropertyListing {
  id: string;
  agentId: string;
  agent: PropertyAgent;
  title: string;
  description: string;
  price: number;
  commissionAmount?: number;
  category: string;
  specifications: Record<string, any>;
  location: string;
  locationAddress?: string;
  locationCity?: string;
  status: PropertyStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  images: PropertyImage[];
}

export interface EarningRecord {
  id: string;
  agentId: string;
  title: string;
  amount: number;
  status: EarningStatus;
  earnedDate: string;
}

export interface PaymentRecord {
  id: string;
  agentId: string;
  agent: {
    id: string;
    fullName: string;
    mobileNumber: string;
  };
  earningId?: string;
  earningTitle?: string | null;
  amount: number;
  transactionId: string;
  paymentMethod: string;
  status: PaymentStatus;
  paymentProofKey?: string;
  previousPendingAmount?: number;
  remainingPendingAmount?: number;
  notes?: string;
  paidAt: string;
  createdAt: string;
}

export interface AgentCreditSummary {
  agentId: string;
  fullName: string;
  mobileNumber: string;
  areaLocation?: string;
  status: AgentStatus;
  totalCommission: number;
  totalPaid: number;
  pendingAmount: number;
  approvedPropertiesCount: number;
  lastPaymentDate?: string | null;
  pendingEarningsCount: number;
}

export interface PendingPaymentRecord {
  id: string;
  agentId: string;
  agent: {
    id: string;
    fullName: string;
    mobileNumber: string;
    areaLocation?: string;
  };
  title: string;
  amount: number;
  status: string;
  earnedDate: string;
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyLocation?: string | null;
}

export interface PaymentAnalytics {
  totalSpent: number;
  todaySpent: number;
  thisWeekSpent: number;
  thisMonthSpent: number;
  totalTransactions: number;
}

export type TicketCategory = 'KYC' | 'PROPERTIES' | 'PAYMENTS' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    fullName: string;
    mobileNumber: string;
    areaLocation: string;
    workPlatform: string;
    status: AgentStatus;
  };
}

export interface TicketAnalytics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface AgentPerformanceSummary {
  agentId: string;
  agentName: string;
  mobileNumber: string;
  areaLocation?: string;
  status: AgentStatus;
  joinedAt: string;
  totalListings: number;
  approvedListings: number;
  totalCommission: number;
  totalPaid: number;
  pendingAmount: number;
  successfulTransactions: number;
  lastTransactionAt?: string | null;
}

export interface PerformanceSummaryResponse {
  summary: {
    totalAgents: number;
    totalListings: number;
    approvedListings: number;
    totalCommission: number;
    totalPaid: number;
    pendingAmount: number;
    successfulTransactions: number;
  };
  data: AgentPerformanceSummary[];
}

export interface SuccessfulTransactionRecord {
  id: string;
  transactionId: string;
  agentId: string;
  agentName: string;
  mobileNumber: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  paymentDate?: string;
  createdAt: string;
  status: 'Successful' | string;
  previousPendingAmount?: number | null;
  remainingPendingAmount?: number | null;
  notes?: string | null;
  relatedProperty?: {
    id: string;
    title: string;
    location: string;
  } | null;
  earningTitle?: string;
  paymentProofUrl?: string | null;
}

export interface AgentPerformanceDetails {
  agent: {
    id: string;
    fullName: string;
    mobileNumber: string;
    areaLocation?: string;
    workPlatform?: string;
    status: AgentStatus;
    joinedAt: string;
    approvedAt?: string | null;
    bankAccount?: {
      accountNumber?: string | null;
      ifscCode?: string;
      upiId?: string;
      phonepeNumber?: string;
      isVerified?: boolean;
    } | null;
    kycStatus: string;
  };
  summary: {
    totalListings: number;
    approvedListings: number;
    totalCommission: number;
    totalPaid: number;
    pendingAmount: number;
    successfulTransactions: number;
  };
  listings: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    commissionAmount: number;
    location: string;
    status: PropertyStatus;
    rejectionReason?: string | null;
    createdAt: string;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    primaryImageUrl?: string | null;
  }>;
  payments: SuccessfulTransactionRecord[];
}
