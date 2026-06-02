import api from './axios';

export const getDashboardAnalytics = (filter = 'all') =>
  api.get('/analytics/dashboard', { params: { filter } }).then((response) => {
    console.log('[analytics api] dashboard response', response.data);
    return response;
  });
