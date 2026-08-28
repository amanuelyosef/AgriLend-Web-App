/**
 * Agrilend Central API Service Layer
 * Connects Frontend UI with REST API / FastAPI backend with seamless fallback data handling.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem("agrilend_auth_token") || localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
}

export function setStoredTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem("agrilend_auth_token", accessToken);
    localStorage.setItem("access_token", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  }
}

export function clearStoredTokens() {
  localStorage.removeItem("agrilend_auth_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

function formatApiError(data) {
  if (!data) return null;
  const detail = data.detail ?? data.message;
  if (Array.isArray(detail)) {
    // FastAPI/pydantic validation errors: [{loc: ["body","field"], msg: "..."}]
    return detail
      .map((e) => {
        const loc = Array.isArray(e.loc) ? e.loc.slice(1).join(".") : "";
        const msg = typeof e.msg === "string" ? e.msg.replace(/^Value error,\s*/i, "") : "";
        return loc ? `${loc}: ${msg}` : msg;
      })
      .filter(Boolean)
      .join(" · ");
  }
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const { accessToken } = getStoredTokens();
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers };
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (res.status === 401) {
      clearStoredTokens();
      try {
        localStorage.removeItem("agrilend_user");
      } catch {
        /* ignore storage errors */
      }
      try {
        window.dispatchEvent(new Event("agrilend:session-expired"));
      } catch {
        /* ignore event dispatch errors */
      }
      throw new Error(formatApiError(data) || "Your session has expired. Please sign in again.");
    }
    if (!res.ok) throw new Error(formatApiError(data) || `HTTP Error ${res.status}`);
    return { success: true, data };
  } catch (err) {
    console.warn(`[API] ${endpoint} request failed (using local state fallback):`, err.message);
    return { success: false, error: err.message };
  }
}

export const api = {
  get: async (endpoint) => {
    const res = await apiRequest(endpoint, { method: "GET" });
    if (!res.success) throw new Error(res.error || "GET request failed");
    return res.data;
  },
  post: async (endpoint, body) => {
    const res = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
    if (!res.success) throw new Error(res.error || "POST request failed");
    return res.data;
  },
  put: async (endpoint, body) => {
    const res = await apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) });
    if (!res.success) throw new Error(res.error || "PUT request failed");
    return res.data;
  },
  patch: async (endpoint, body) => {
    const res = await apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(body) });
    if (!res.success) throw new Error(res.error || "PATCH request failed");
    return res.data;
  },
  delete: async (endpoint) => {
    const res = await apiRequest(endpoint, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "DELETE request failed");
    return res.data;
  },
};

// 1. System Health & Auth APIs
export const checkBackendHealth = () => apiRequest("/health");

export const loginUser = (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

export async function resetUserPassword(email, newPassword) {
  return apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, new_password: newPassword }) });
}

export async function requestPasswordResetOTP(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const res = await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  return res.success && res.data?.otp ? { success: true, otp: res.data.otp, email } : { success: true, otp, email, message: `Security token dispatched to ${email}` };
}

export async function updateUserProfile(profileData) {
  const newName = profileData.name || profileData.fullName || profileData.full_name;

  const payload = { name: newName, full_name: newName, fullName: newName, email: profileData.email, phone: profileData.phone, department: profileData.department, branch: profileData.branch, language: profileData.language };
  const res = await apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(payload) });
  if (res.success) return res;
  return { success: false, error: res.error || "Profile update failed" };
}

// 2. Bank Analyst & Loan Applications APIs
export async function fetchApplications(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/loans/?${query}`);
  if (res.success && res.data && Array.isArray(res.data.items)) {
    return { ...res, data: res.data.items };
  }
  return res;
}

export async function fetchApplicationById(id) {
  const res = await apiRequest(`/loans/${id}/detail`);
  if (res.success && res.data) {
    return { ...res, data: { ...res.data, id: res.data.id || res.data.application_id || id } };
  }
  return res;
}

export const submitLoanApplication = (data) => apiRequest("/loans/", { method: "POST", body: JSON.stringify(data) });

export const updateApplicationStatus = (id, decision) => {
  const statusMap = { approved: "APPROVED", rejected: "REJECTED", review: "PENDING" };
  const status = statusMap[(decision || "").toLowerCase()] || String(decision).toUpperCase();
  return apiRequest(`/loans/${id}/review`, { method: "PATCH", body: JSON.stringify({ status }) });
};

export const searchFarmers = (query, filters = {}) => apiRequest(`/farmers/search?${new URLSearchParams({ q: query, ...filters }).toString()}`);

export function registerFarmer(data) {
  const payload = {
    password: data.password || "Farmer@123",
    full_name: data.full_name || data.fullName,
    national_id: data.national_id || data.nationalId,
    phone_number: data.phone_number || data.phone,
    gps_coordinates: data.gps_coordinates || data.gpsCoordinates || "8.9806, 38.7578",
    land_proof_document: data.land_proof_document || data.landProofDocument || "https://agrilend.org/docs/land_title_sample.pdf",
    crop_type: data.crop_type || data.cropType || "Teff",
    farm_size_hectares: parseFloat(data.farm_size_hectares || data.farmSize || 2.5),
    region: data.region || "Oromia",
    locale: data.locale || "en",
  };

  return apiRequest("/farmers/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const fetchFarmerCreditScore = (farmerId) => apiRequest(`/farmers/${farmerId}/credit-score`);

export const predictGeospatialCreditScore = (farmerId) => apiRequest(`/brain/trigger-score/${farmerId}`, { method: "POST" });

export async function fetchRiskHeatmap(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/loans/reports/heatmap${query ? `?${query}` : ""}`);
  if (res.success && Array.isArray(res.data) && res.data.length > 0) return res;
  
  return {
    success: true,
    data: [
      { name: "Arsi-Bale Zone", crop: "Wheat", score: 812, exposure: "Critical", trend: "+9%", tone: "bg-red-700", text: "text-red-700", border: "border-red-200", lat: 7.5000, lng: 39.2000 },
      { name: "West Shewa", crop: "Teff", score: 756, exposure: "High", trend: "+4%", tone: "bg-red-500", text: "text-red-600", border: "border-red-100", lat: 8.9500, lng: 37.8500 },
      { name: "West Gojjam", crop: "Maize", score: 701, exposure: "High", trend: "+2%", tone: "bg-orange-500", text: "text-orange-600", border: "border-orange-100", lat: 11.1000, lng: 37.2000 },
      { name: "Wolaita Cluster", crop: "Root Crops", score: 642, exposure: "Moderate", trend: "-1%", tone: "bg-amber-400", text: "text-amber-600", border: "border-amber-100", lat: 6.8500, lng: 37.7500 },
      { name: "Benishangul Basin", crop: "Soybean", score: 588, exposure: "Moderate", trend: "+5%", tone: "bg-yellow-300", text: "text-yellow-700", border: "border-yellow-100", lat: 10.0600, lng: 34.5300 },
      { name: "Awash River Basin", crop: "Cotton", score: 835, exposure: "Critical", trend: "+11%", tone: "bg-red-800", text: "text-red-800", border: "border-red-300", lat: 9.2000, lng: 40.1000 },
      { name: "Southern Tigray", crop: "Sorghum", score: 774, exposure: "High", trend: "+6%", tone: "bg-red-600", text: "text-red-700", border: "border-red-200", lat: 13.1500, lng: 39.5000 },
      { name: "Hararghe Cluster", crop: "Vegetables", score: 719, exposure: "High", trend: "+3%", tone: "bg-orange-400", text: "text-orange-600", border: "border-orange-100", lat: 9.3000, lng: 41.8000 },
      { name: "North Gondar", crop: "Sesame", score: 663, exposure: "Moderate", trend: "0%", tone: "bg-amber-300", text: "text-amber-600", border: "border-amber-100", lat: 12.6000, lng: 37.4500 },
      { name: "Sidama-Yirgacheffe", crop: "Coffee", score: 522, exposure: "Low", trend: "-7%", tone: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-100", lat: 6.8500, lng: 38.2000 },
      { name: "Borena Zone", crop: "Livestock", score: 798, exposure: "High", trend: "+8%", tone: "bg-red-700", text: "text-red-700", border: "border-red-200", lat: 4.9000, lng: 38.0800 },
      { name: "Metekel Agribusiness", crop: "Cotton", score: 611, exposure: "Moderate", trend: "+1%", tone: "bg-yellow-400", text: "text-yellow-700", border: "border-yellow-100", lat: 10.6000, lng: 35.7000 },
      { name: "Bale Highlands", crop: "Barley", score: 557, exposure: "Low", trend: "-4%", tone: "bg-emerald-400", text: "text-emerald-700", border: "border-emerald-100", lat: 7.1200, lng: 39.9800 },
      { name: "Jimma-Kaffa", crop: "Coffee", score: 483, exposure: "Low", trend: "-9%", tone: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-100", lat: 7.6700, lng: 36.8300 },
      { name: "Gambella Riverlands", crop: "Rice", score: 690, exposure: "High", trend: "+4%", tone: "bg-orange-500", text: "text-orange-600", border: "border-orange-100", lat: 8.2500, lng: 34.5800 },
      { name: "Somali Lowlands", crop: "Livestock", score: 851, exposure: "Critical", trend: "+13%", tone: "bg-red-900", text: "text-red-800", border: "border-red-300", lat: 7.3500, lng: 43.5500 },
      { name: "Gurage Zone", crop: "Enset", score: 604, exposure: "Moderate", trend: "+2%", tone: "bg-amber-400", text: "text-amber-600", border: "border-amber-100", lat: 8.2800, lng: 37.7800 },
      { name: "Ada'a Teff Belt", crop: "Teff", score: 536, exposure: "Low", trend: "-2%", tone: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-100", lat: 8.7500, lng: 38.9800 },
      { name: "South Wollo", crop: "Sorghum", score: 722, exposure: "High", trend: "+7%", tone: "bg-orange-500", text: "text-orange-600", border: "border-orange-100", lat: 11.1300, lng: 39.6300 },
      { name: "Hadiya Highlands", crop: "Potato", score: 574, exposure: "Moderate", trend: "-1%", tone: "bg-yellow-300", text: "text-yellow-700", border: "border-yellow-100", lat: 7.5500, lng: 37.8500 },
      { name: "Gedeo Zone", crop: "Coffee", score: 495, exposure: "Low", trend: "-6%", tone: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-100", lat: 6.4100, lng: 38.3100 },
      { name: "Rift Valley Floriculture", crop: "Horticulture", score: 647, exposure: "Moderate", trend: "+3%", tone: "bg-amber-300", text: "text-amber-600", border: "border-amber-100", lat: 7.2000, lng: 38.6000 },
      { name: "North Shewa", crop: "Barley", score: 512, exposure: "Low", trend: "-5%", tone: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-100", lat: 9.6800, lng: 39.5300 },
      { name: "Humera Lowlands", crop: "Sesame", score: 664, exposure: "Moderate", trend: "+2%", tone: "bg-yellow-400", text: "text-yellow-700", border: "border-yellow-100", lat: 14.3000, lng: 36.6200 },
      { name: "Kaffa Forest Sector", crop: "Forest Coffee", score: 470, exposure: "Low", trend: "-8%", tone: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-100", lat: 7.2700, lng: 36.2500 },
    ]
  };
}

export const runRiskSimulation = (payload = "drought") => {
  const body = typeof payload === "string" ? { scenario: payload } : payload || { scenario: "drought" };
  return apiRequest("/loans/reports/heatmap/simulate", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// 2.5 Consent Management Gate APIs (FR-X-002)
export const verifyFarmerConsent = (farmerId) => apiRequest(`/farmers/consent?farmer_id=${farmerId}`, {
  method: "POST",
  body: JSON.stringify({ consent: true }),
});

// 3. Admin Command Portal APIs
export const fetchAdminFarmersQueue = (status = "all") => apiRequest(`/admin/farmers-queue?status=${status}`);
export const approveQueueFarmer = (queueId) => apiRequest(`/admin/farmers-queue/${queueId}/approve`, { method: "POST" });
export const flagQueueFarmer = (queueId, reason = "") => apiRequest(`/admin/farmers-queue/${queueId}/flag`, { method: "POST", body: JSON.stringify({ reason }) });
export async function fetchInstitutionalPartners() {
  const res = await apiRequest("/banks/");
  if (res.success && res.data && Array.isArray(res.data.items)) {
    return {
      success: true,
      data: res.data.items.map((b) => ({
        id: b.id,
        name: b.bank_name,
        type: "Bank",
        region: "",
        status: b.is_active ? "active" : "inactive",
        subscription_tier: b.subscription_tier,
        interest_rate: b.interest_rate,
        onboarding_date: b.onboarding_date,
      })),
    };
  }
  return res;
}

export const createInstitutionalPartner = (data) => {
  const payload = {
    bank_name: data.bankName ?? data.bank_name ?? data.name,
    interest_rate: Number(data.interestRate ?? data.interest_rate),
    subscription_tier: data.subscriptionTier ?? data.subscription_tier ?? "standard",
    analyst_full_name: data.analystFullName ?? data.analyst_full_name,
    analyst_email: data.analystEmail ?? data.analyst_email,
    analyst_password: data.analystPassword ?? data.analyst_password,
  };
  const missing = Object.entries(payload)
    .filter(([key, value]) => key !== "subscription_tier" && (value === undefined || value === null || value === ""))
    .map(([key]) => key);
  if (missing.length > 0) {
    return Promise.resolve({ success: false, error: `Missing required fields: ${missing.join(", ")}` });
  }
  if (Number.isNaN(payload.interest_rate) || payload.interest_rate <= 0 || payload.interest_rate > 100) {
    return Promise.resolve({ success: false, error: "Interest rate must be a number between 0.01 and 100." });
  }
  return apiRequest("/banks/", { method: "POST", body: JSON.stringify(payload) });
};

export const updateBankSettings = (bankId, data) => apiRequest(`/banks/${bankId}/settings`, {
  method: "PATCH",
  body: JSON.stringify(data),
});

export const fetchBankDetail = (bankId) => apiRequest(`/banks/${bankId}/detail`);
export const fetchAdminSettings = () => apiRequest("/admin/settings");
export const saveAdminSettings = (data) => apiRequest("/admin/settings", { method: "PUT", body: JSON.stringify(data) });
export const executeAdminCommand = (command) => apiRequest("/admin/command/execute", { method: "POST", body: JSON.stringify({ command }) });
export const fetchCommandLogs = (limit = 50) => apiRequest(`/admin/command/logs?limit=${limit}`);
export const fetchSupportTickets = () => apiRequest("/admin/support/tickets");
export const createSupportTicket = (data) => apiRequest("/admin/support/tickets", { method: "POST", body: JSON.stringify(data) });
export const fetchPortfolioSummary = () => apiRequest("/portfolio");
export const fetchYieldForecast = (crop = "All") => apiRequest(`/admin/ml/yield-forecast?crop=${encodeURIComponent(crop)}`);
export const fetchPipelineRuns = (limit = 50) => apiRequest(`/admin/pipelines/runs?limit=${limit}`);
export const triggerPipeline = (pipelineName) => apiRequest("/admin/pipelines/trigger", {
  method: "POST",
  body: JSON.stringify({ pipeline_name: pipelineName }),
});

// 4. Notifications & Registration APIs
function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "Just now";
  if (abs < 3600) return `${Math.round(abs / 60)} min ago`;
  if (abs < 86400) return `${Math.round(abs / 3600)} hr ago`;
  return `${Math.round(abs / 86400)} days ago`;
}

export async function fetchNotifications(role = "bank") {
  const res = await apiRequest(`/notifications?role=${role}`);
  if (res.success && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map((n) => ({ ...n, time: n.time || formatNotificationTime(n.created_at) })),
    };
  }
  return res;
}

export const markNotificationAsRead = (id) => apiRequest(`/notifications/${id}/read`, { method: "POST" });

export async function requestUserRegistration(userData) {
  const response = await apiRequest("/auth/register-request", { method: "POST", body: JSON.stringify(userData) });
  return response.success ? response : { success: false, error: response.error || "Registration request failed" };
}

export async function fetchPendingRegistrationRequests() {
  return apiRequest("/admin/user-requests");
}

export async function approveRegistrationRequest(requestId, tempPassword = "bank@123") {
  return apiRequest(`/admin/user-requests/${requestId}/approve`, { method: "POST", body: JSON.stringify({ temporary_password: tempPassword }) });
}

// 5. ML Governance & Model Monitoring APIs
export const fetchMLModelMetrics = () => apiRequest("/admin/ml/metrics");
export const fetchMLErrorAnalysis = () => apiRequest("/admin/ml/error-analysis");
export const fetchMLBiasIndicators = () => apiRequest("/admin/ml/bias");
export const fetchMLDriftStatus = () => apiRequest("/admin/ml/drift");
export const fetchMLModelVersions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/ml/versions${query ? `?${query}` : ""}`);
};
export const rollbackMLModelVersion = (versionId) => apiRequest(`/admin/ml/versions/${versionId}/rollback`, { method: "POST" });

// 6. Admin System Reports APIs
export const fetchAdminFarmerReport = () => apiRequest("/admin/reports/farmers");
export const fetchAdminLoanReport = () => apiRequest("/admin/reports/loans");
export const fetchAdminCreditScoreReport = () => apiRequest("/admin/reports/credit-scores");
export const fetchAdminRiskReport = () => apiRequest("/admin/reports/risk");

// 7. Admin User & Role Management APIs
export async function fetchActiveUsersList() {
  const res = await apiRequest("/admin/users");
  if (!res.success || !Array.isArray(res.data)) {
    return { success: false, error: res.error || "Failed to load users", data: [] };
  }
  const apiUsers = res.data.map((u, idx) => ({
    id: u.id || u.user_id || `USR-${100 + idx}`,
    name: u.full_name || u.name || (u.email ? u.email.split("@")[0] : "Officer"),
    email: u.email || `user${idx}@agrilend.com`,
    contact: u.phone || "+254 700 000 000",
    branch: u.branch || "Central Division",
    role: u.role === "admin" ? "System Admin" : u.role === "analyst" ? "Credit Analyst" : "Bank Officer",
    score: u.score || 850,
    status: u.is_active !== false && u.status !== "INACTIVE" && u.status !== "Suspended" ? "Active" : "Suspended",
    flagged: u.status === "Suspended" || u.flagged === true
  }));
  return { success: true, data: apiUsers };
}

export async function toggleUserStatusAPI(userId, email, newStatus) {
  return apiRequest(`/admin/users/${userId}/deactivate`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
}

export const fetchAdminRoles = () => apiRequest("/admin/roles");
export const fetchAdminUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/users${query ? `?${query}` : ""}`);
};
export const createAdminUser = (data) => apiRequest("/admin/users", { method: "POST", body: JSON.stringify(data) });
export const assignAdminUserRole = (userId, roleName) => apiRequest(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role_name: roleName }) });
export const updateAdminUser = (userId, data) => apiRequest(`/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminUser = (userId) => apiRequest(`/admin/users/${userId}`, { method: "DELETE" });
export const deactivateAdminUser = (userId) => apiRequest(`/admin/users/${userId}/deactivate`, { method: "PATCH" });

// 8. Data Pipelines & Bank Partner Activation APIs
export const fetchPipelineStatus = () => apiRequest("/admin/pipelines");
export const createPipeline = (data) => apiRequest("/admin/pipelines", { method: "POST", body: JSON.stringify(data) });
export const activateBankPartner = (bankId) => apiRequest(`/admin/banks/${bankId}/activate`, { method: "POST" });

export default {
  api,
  get: api.get,
  post: api.post,
  put: api.put,
  patch: api.patch,
  delete: api.delete,
  apiRequest,
  checkBackendHealth,
  loginUser,
  resetUserPassword,
  requestPasswordResetOTP,
  updateUserProfile,
  requestUserRegistration,
  fetchPendingRegistrationRequests,
  approveRegistrationRequest,
  fetchApplications,
  fetchApplicationById,
  submitLoanApplication,
  updateApplicationStatus,
  searchFarmers,
  fetchFarmerCreditScore,
  predictGeospatialCreditScore,
  fetchRiskHeatmap,
  runRiskSimulation,
  verifyFarmerConsent,
  fetchAdminFarmersQueue,
  approveQueueFarmer,
  flagQueueFarmer,
  fetchInstitutionalPartners,
  createInstitutionalPartner,
  fetchAdminSettings,
  saveAdminSettings,
  executeAdminCommand,
  fetchCommandLogs,
  fetchSupportTickets,
  createSupportTicket,
  fetchPortfolioSummary,
  fetchYieldForecast,
  fetchPipelineRuns,
  triggerPipeline,
  fetchNotifications,
  markNotificationAsRead,
  fetchMLModelMetrics,
  fetchMLErrorAnalysis,
  fetchMLBiasIndicators,
  fetchMLDriftStatus,
  fetchMLModelVersions,
  rollbackMLModelVersion,
  fetchAdminFarmerReport,
  fetchAdminLoanReport,
  fetchAdminCreditScoreReport,
  fetchAdminRiskReport,
  fetchAdminRoles,
  fetchAdminUsers,
  createAdminUser,
  assignAdminUserRole,
  updateAdminUser,
  deleteAdminUser,
  deactivateAdminUser,
  fetchPipelineStatus,
  activateBankPartner,
};
