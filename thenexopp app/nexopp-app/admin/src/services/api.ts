import axios from 'axios';
import { AgentSummary, AgentStatus, PropertyListing, PropertyStatus, PaymentRecord, PaymentAnalytics } from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? (window.location.hostname.includes('thenexopp.com')
        ? `${window.location.protocol}//${window.location.hostname}/api/v1`
        : `http://${window.location.hostname || 'localhost'}:3000/api/v1`)
    : 'http://localhost:3000/api/v1');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add bearer token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add 401 response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/auth/admin/login')) {
      localStorage.removeItem('admin_token');
      if (typeof window !== 'undefined') {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  },
);

export const AdminApiService = {
  // Authentication
  async login(username: string, password: string) {
    const res = await api.post('/auth/admin/login', { username, password });
    if (res.data.success) {
      localStorage.setItem('admin_token', res.data.data.accessToken);
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('admin_token');
  },

  // Agents
  async getAgents(status?: AgentStatus, search?: string): Promise<{ success: boolean; data: AgentSummary[] }> {
    const res = await api.get('/admin/agents', { params: { status, search } });
    return res.data;
  },

  async reviewKyc(agentId: string, approve: boolean, rejectionReason?: string) {
    const res = await api.put(`/admin/agents/${agentId}/kyc`, { approve, rejectionReason });
    return res.data;
  },

  async updateAgentStatus(agentId: string, status: AgentStatus, rejectionReason?: string) {
    const res = await api.put(`/admin/agents/${agentId}/status`, { status, rejectionReason });
    return res.data;
  },

  // Properties
  async getProperties(params?: {
    status?: PropertyStatus;
    startDate?: string;
    endDate?: string;
    agentId?: string;
    search?: string;
  }): Promise<{ success: boolean; data: PropertyListing[] }> {
    const res = await api.get('/admin/properties', { params });
    return res.data;
  },

  async reviewProperty(propertyId: string, approve: boolean, rejectionReason?: string, commissionAmount?: number) {
    const res = await api.put(`/admin/properties/${propertyId}/review`, { approve, rejectionReason, commissionAmount });
    return res.data;
  },

  // Agent Credits & Financials
  async getAgentCredits(search?: string): Promise<{
    success: boolean;
    summary: { totalCommission: number; totalPaid: number; totalPending: number; totalAgents: number };
    data: import('../types').AgentCreditSummary[];
  }> {
    const res = await api.get('/admin/agents/credits', { params: { search } });
    return res.data;
  },

  async payAgent(data: {
    agentId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
    paymentProofKey?: string;
  }) {
    const res = await api.post('/admin/pay-agent', data);
    return res.data;
  },

  // Earnings & Financials
  async getPayments(params?: {
    startDate?: string;
    endDate?: string;
    agentId?: string;
    search?: string;
  }): Promise<{ success: boolean; analytics: PaymentAnalytics; data: PaymentRecord[] }> {
    const res = await api.get('/admin/payments', { params });
    return res.data;
  },

  async createEarning(agentId: string, title: string, amount: number, propertyId?: string) {
    const res = await api.post('/admin/earnings', { agentId, title, amount, propertyId });
    return res.data;
  },

  async recordPayment(agentId: string, amount: number, transactionId: string, paymentMethod = 'UPI', earningId?: string, paymentProofKey?: string) {
    const res = await api.post('/admin/payments', {
      agentId,
      amount,
      transactionId,
      paymentMethod,
      earningId,
      paymentProofKey,
    });
    return res.data;
  },

  async deletePayment(paymentId: string) {
    const res = await api.delete(`/admin/payments/${paymentId}`);
    return res.data;
  },

  async getPendingPayments(search?: string): Promise<{ success: boolean; totalPendingAmount: number; totalCount: number; data: import('../types').PendingPaymentRecord[] }> {
    const res = await api.get('/admin/pending-payments', { params: { search } });
    return res.data;
  },

  async settlePendingPayment(earningId: string, transactionId: string, paymentMethod = 'UPI', paymentProofKey?: string) {
    const res = await api.post(`/admin/pending-payments/${earningId}/settle`, {
      transactionId,
      paymentMethod,
      paymentProofKey,
    });
    return res.data;
  },

  // Support Tickets
  async getTickets(params?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<{ success: boolean; data: any[]; analytics: { total: number; open: number; inProgress: number; resolved: number } }> {
    const res = await api.get('/admin/tickets', { params });
    return res.data;
  },

  async updateTicket(ticketId: string, data: { status?: string; priority?: string; resolution?: string }) {
    const res = await api.patch(`/admin/tickets/${ticketId}`, data);
    return res.data;
  },

  async updateTicketStatus(ticketId: string, status: string, internalNotes?: string) {
    const res = await api.patch(`/admin/tickets/${ticketId}`, { status, internalNotes });
    return res.data;
  },

  async deleteTicket(ticketId: string) {
    const res = await api.delete(`/admin/tickets/${ticketId}`);
    return res.data;
  },

  // Agent Deletion & Updates
  async deleteAgent(agentId: string) {
    const res = await api.delete(`/admin/agents/${agentId}`);
    return res.data;
  },

  async updateAgent(agentId: string, data: any) {
    const res = await api.put(`/admin/agents/${agentId}`, data);
    return res.data;
  },

  // KYC Deletion & Updates
  async deleteKyc(agentId: string) {
    const res = await api.delete(`/admin/kyc/${agentId}`);
    return res.data;
  },

  async updateKyc(agentId: string, data: any) {
    const res = await api.put(`/admin/kyc/${agentId}`, data);
    return res.data;
  },

  // Property Deletion & Updates
  async deleteProperty(propertyId: string) {
    const res = await api.delete(`/admin/properties/${propertyId}`);
    return res.data;
  },

  async updateProperty(propertyId: string, data: any) {
    const res = await api.put(`/admin/properties/${propertyId}`, data);
    return res.data;
  },

  // Earning / Pending Payment Deletion
  async deleteEarning(earningId: string) {
    const res = await api.delete(`/admin/earnings/${earningId}`);
    return res.data;
  },

  // Agent Performance & Transactions Engine
  async getAgentPerformanceSummary(search?: string, status?: string) {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;
    const res = await api.get('/admin/performance/summary', { params });
    return res.data;
  },

  async getSuccessfulTransactions(search?: string, startDate?: string, endDate?: string, agentId?: string) {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (agentId) params.agentId = agentId;
    const res = await api.get('/admin/performance/transactions', { params });
    return res.data;
  },

  async getAgentPerformanceDetails(agentId: string) {
    const res = await api.get(`/admin/performance/agents/${agentId}`);
    return res.data;
  },

  // Direct Physical File Upload Engine
  async directUpload(file: File, bucketType: string = 'property-images') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucketType', bucketType);
    const res = await api.post('/uploads/direct-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default api;
