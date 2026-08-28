import api from './client';

export function listFarmers({ page = 1, page_size = 20, region } = {}) {
  return api('/farmers/', { params: { page, page_size, region } });
}

export function searchFarmers(q) {
  return api('/farmers/search', { params: { q } });
}

export function getFarmer(farmerId) {
  return api(`/farmers/profile/${farmerId}`);
}

export function getCreditScore(farmerId) {
  return api(`/farmers/${farmerId}/credit-score`);
}

export function getCreditHistory(farmerId) {
  return api(`/farmers/${farmerId}/credit-history`);
}

export function getFarmStatus(farmerId) {
  return api(`/farmers/${farmerId}/farm-status`);
}

export function getExplain(farmerId) {
  return api(`/farmers/${farmerId}/explain`);
}

export function registerFarmer(payload) {
  return api('/farmers/register', { method: 'POST', auth: false, body: payload });
}

export function getParcels(farmerId) {
  return api(`/farmers/${farmerId}/parcels`);
}
