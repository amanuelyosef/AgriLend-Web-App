import api from './client';

export function banks() {
  return api('/banks/');
}

export function getBank(bankId) {
  return api(`/banks/${bankId}/detail`);
}

export function portfolio() {
  return api('/portfolio');
}

export function riskReport() {
  return api('/admin/reports/risk');
}

export function dashboardReport() {
  return api('/loans/reports/dashboard');
}

export function notifications() {
  return api('/notifications');
}

export function markNotificationRead(id) {
  return api(`/notifications/${id}/read`, { method: 'POST' });
}

export function yieldForecast(crop) {
  return api('/admin/ml/yield-forecast', { params: { crop } });
}

export function pipelineRuns() {
  return api('/admin/pipelines/runs');
}
