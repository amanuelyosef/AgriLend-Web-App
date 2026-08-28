import api from './client';

export function listBanks({ page = 1, page_size = 20 } = {}) {
  return api('/banks/', { params: { page, page_size } });
}

export function createBank(payload) {
  return api('/banks/', { method: 'POST', body: payload });
}

export function getBankDetail(bankId) {
  return api(`/banks/${bankId}/detail`);
}
