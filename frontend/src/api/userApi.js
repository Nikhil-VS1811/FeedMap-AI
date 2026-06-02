import api from './axios';

export const getAllUsers = () => api.get('/users/admin/all');

export const updateNgoApproval = (userId, ngoApprovalStatus) =>
  api.patch(`/users/admin/${userId}/ngo-approval`, { ngoApprovalStatus });
