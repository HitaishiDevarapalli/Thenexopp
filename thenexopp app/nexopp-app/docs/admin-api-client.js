/**
 * TheNexopp Agent — Admin Integration Client for thenexopp.com/admin
 * 
 * Usage in your thenexopp.com/admin Web Frontend:
 * Import or include these functions to manage Agents, KYC, Properties, and Payouts.
 */

const AGENT_API_BASE_URL = 'https://api.thenexopp.com/api/v1';

/**
 * Helper to make authenticated requests from thenexopp.com/admin to Agent API
 */
async function callAgentApi(endpoint, method = 'GET', body = null, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${AGENT_API_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

// ==========================================
// 1. AGENTS MANAGEMENT
// ==========================================

/**
 * Fetch all registered agents (optional filter by status: PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED)
 */
export async function getAgentsList(statusFilter = '', adminToken = '') {
  const query = statusFilter ? `?status=${statusFilter}` : '';
  return await callAgentApi(`/admin/agents${query}`, 'GET', null, adminToken);
}

/**
 * Approve or Reject Agent KYC Documents
 * @param {string} agentId - UUID of the agent
 * @param {boolean} approve - true to approve, false to reject
 * @param {string} [rejectionReason] - Required if approve is false
 */
export async function reviewAgentKyc(agentId, approve, rejectionReason = '', adminToken = '') {
  return await callAgentApi(`/admin/agents/${agentId}/kyc`, 'PUT', {
    approve,
    rejectionReason
  }, adminToken);
}

/**
 * Change Agent Account Status (APPROVED, REJECTED, SUSPENDED)
 * @param {string} agentId - UUID of the agent
 * @param {'APPROVED'|'REJECTED'|'SUSPENDED'} status
 * @param {string} [rejectionReason]
 */
export async function updateAgentStatus(agentId, status, rejectionReason = '', adminToken = '') {
  return await callAgentApi(`/admin/agents/${agentId}/status`, 'PUT', {
    status,
    rejectionReason
  }, adminToken);
}

// ==========================================
// 2. PROPERTY LISTINGS REVIEW
// ==========================================

/**
 * Approve or Reject a Property Listing submitted by an agent
 * @param {string} propertyId - UUID of the property
 * @param {boolean} approve - true to approve, false to reject
 * @param {string} [rejectionReason]
 */
export async function reviewPropertyListing(propertyId, approve, rejectionReason = '', adminToken = '') {
  return await callAgentApi(`/admin/properties/${propertyId}/review`, 'PUT', {
    approve,
    rejectionReason
  }, adminToken);
}

// ==========================================
// 3. EARNINGS & PAYOUTS LEDGER
// ==========================================

/**
 * Credit Commission Earning to an Agent
 * @param {string} agentId - UUID of the agent
 * @param {string} title - Earning title / description
 * @param {number} amount - Amount in INR
 * @param {string} [propertyId] - Optional associated property ID
 */
export async function addAgentEarning(agentId, title, amount, propertyId = null, adminToken = '') {
  return await callAgentApi('/admin/earnings', 'POST', {
    agentId,
    title,
    amount,
    propertyId
  }, adminToken);
}

/**
 * Record a Payout Payment Transaction to an Agent
 * @param {string} agentId - UUID of the agent
 * @param {number} amount - Payout amount in INR
 * @param {string} transactionId - Bank / UPI transaction ID (e.g. TXN12345678)
 * @param {string} paymentMethod - UPI, NEFT, RTGS, IMPS
 * @param {string} [earningId] - Optional earning ID being paid out
 * @param {string} [paymentProofKey] - MinIO key for uploaded payment receipt
 */
export async function recordAgentPayout(agentId, amount, transactionId, paymentMethod = 'UPI', earningId = null, paymentProofKey = null, adminToken = '') {
  return await callAgentApi('/admin/payments', 'POST', {
    agentId,
    amount,
    transactionId,
    paymentMethod,
    earningId,
    paymentProofKey
  }, adminToken);
}
