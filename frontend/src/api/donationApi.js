import api from './axios';

const logDonationResponse = (label) => (response) => {
  console.log(`[donation api] ${label} response`, response.data);
  return response;
};

export const createDonation = (payload) => api.post('/donations', payload).then(logDonationResponse('createDonation'));

export const getDonorDonations = () => api.get('/donations/my-donations').then(logDonationResponse('getDonorDonations'));

export const getAvailableDonations = (params = {}) =>
  api.get('/donations/available', { params }).then(logDonationResponse('getAvailableDonations'));

export const getPrioritizedDonations = () => api.get('/donations/prioritized').then(logDonationResponse('getPrioritizedDonations'));

export const getNearbyDonations = ({ latitude, longitude }) =>
  api.get('/donations/nearby', { params: { latitude, longitude } }).then(logDonationResponse('getNearbyDonations'));

export const getActiveDonations = getAvailableDonations;

export const getAcceptedDonations = () => api.get('/donations/accepted').then(logDonationResponse('getAcceptedDonations'));

export const getAssignedDeliveries = () => api.get('/donations/delivery/assigned').then(logDonationResponse('getAssignedDeliveries'));

export const getAllDonations = () => api.get('/donations').then(logDonationResponse('getAllDonations'));

export const acceptDonation = (donationId) => api.patch(`/donations/${donationId}/accept`).then(logDonationResponse('acceptDonation'));

export const rejectDonation = (donationId) => api.patch(`/donations/${donationId}/reject`).then(logDonationResponse('rejectDonation'));

export const assignDelivery = (donationId, deliveryId) =>
  api.patch(`/donations/${donationId}/assign-delivery`, { deliveryId }).then(logDonationResponse('assignDelivery'));

export const updateDonationStatus = (donationId, status) =>
  api.patch(`/donations/${donationId}/status`, { status }).then(logDonationResponse('updateDonationStatus'));

export const removeDonation = (donationId) => api.delete(`/donations/${donationId}`).then(logDonationResponse('removeDonation'));
