import api from './client';

export function listLoans({ status, region, crop_type, page = 1, page_size = 20, min_amount, max_amount } = {}) {
  return api('/loans/', { params: { status, region, crop_type, page, page_size, min_amount, max_amount } });
}

export function getLoan(applicationId) {
  return api(`/loans/${applicationId}`);
}

export function getLoanDetail(applicationId) {
  return api(`/loans/${applicationId}/detail`);
}

export function createLoan(payload) {
  return api('/loans/', { method: 'POST', body: payload });
}

export function reviewLoan(applicationId, status) {
  return api(`/loans/${applicationId}/review`, { method: 'PATCH', body: { status } });
}

export function dashboardReport() {
  return api('/loans/reports/dashboard');
}

export function highRiskLoans() {
  return api('/loans/reports/high-risk');
}

export function heatmap() {
  return api('/loans/reports/heatmap');
}

export function simulateHeatmap(payload) {
  return api('/loans/reports/heatmap/simulate', { method: 'POST', body: payload });
}
