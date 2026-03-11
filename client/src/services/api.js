import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  uploadCertificate: (formData) =>
    api.post('/auth/upload-certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Surf Spot API
export const surfSpotAPI = {
  getAll: (params) => api.get('/surfspots', { params }),
  getById: (id) => api.get(`/surfspots/${id}`),
  create: (formData) =>
    api.post('/surfspots', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, data) => api.put(`/surfspots/${id}`, data),
  delete: (id) => api.delete(`/surfspots/${id}`),
  getOwnerSpots: () => api.get('/surfspots/owner/my-spots'),
};

// Booking API
export const bookingAPI = {
  calculatePrice: (data) => api.post('/bookings/calculate-price', data),
  checkAvailability: (data) => api.post('/bookings/check-availability', data),
  checkGuideAvailability: (data) => api.post('/bookings/check-guide-availability', data),
  checkGearAvailability: (data) => api.post('/bookings/check-gear-availability', data),
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getOwnerBookings: () => api.get('/bookings/owner/all'),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getDailyIncome: () => api.get('/bookings/owner/daily-income'),
  getMonthlyReport: () => api.get('/bookings/owner/monthly-report'),
  getYearlyReport: () => api.get('/bookings/owner/yearly-report'),
};

// Guide API
export const guideAPI = {
  getAll: () => api.get('/guides'),
  getById: (id) => api.get(`/guides/${id}`),
  getProfile: () => api.get('/guides/profile'),
  createProfile: (data) => api.post('/guides', data),
  updateProfile: (data) => api.put('/guides/profile', data),
  uploadProfileImage: (formData) =>
    api.post('/guides/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getSchedule: () => api.get('/guides/schedule'),
  acceptBooking: (id) => api.put(`/guides/bookings/${id}/accept`),
  rejectBooking: (id) => api.put(`/guides/bookings/${id}/reject`),
  requestHire: (guideId, surfSpotId) => api.post(`/guides/${guideId}/request-hire`, { surfSpotId }),
  getHireRequests: () => api.get('/guides/my-hire-requests'),
  acceptHireRequest: (requestId) => api.put(`/guides/hire-requests/${requestId}/accept`),
  rejectHireRequest: (requestId) => api.put(`/guides/hire-requests/${requestId}/reject`),
  getOwnerHireRequests: () => api.get('/guides/owner/hire-requests'),
  assignGuideToBooking: (bookingId, guideId) => api.put('/guides/assign-to-booking', { bookingId, guideId }),
};

// Gear API
export const gearAPI = {
  getAll: () => api.get('/gears'),
  getById: (id) => api.get(`/gears/${id}`),
  getBySurfSpot: (surfSpotId) => api.get(`/gears/surfspot/${surfSpotId}`),
  getOwnerGears: () => api.get('/gears/owner/my-gears'),
  create: (formData) =>
    api.post('/gears', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, data) => api.put(`/gears/${id}`, data),
  delete: (id) => api.delete(`/gears/${id}`),
};

// Destination API
export const destinationAPI = {
  getAll: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  create: (formData) =>
    api.post('/destinations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, formData) =>
    api.put(`/destinations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id) => api.delete(`/destinations/${id}`),
  addReview: (id, data) => api.post(`/destinations/${id}/reviews`, data),
};

// Payment API
export const paymentAPI = {
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
  downloadReceipt: (bookingId) => api.get(`/payments/receipt/${bookingId}`, { responseType: 'blob' }),
};

// Admin API
export const adminAPI = {
  verifyOwner: (id) => api.put(`/admin/verify-owner/${id}`),
  verifyGuide: (id) => api.put(`/admin/verify-guide/${id}`),
  verifyGear: (id) => api.put(`/admin/verify-gear/${id}`),
  verifySurfSpot: (id) => api.put(`/admin/verify-surfspot/${id}`),
  suspendUser: (id) => api.put(`/admin/suspend-user/${id}`),
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingVerifications: () => api.get('/admin/pending-verifications'),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Chat API (Chatbot for surf recommendations)
export const chatAPI = {
  initializeChat: () => api.post('/chat/initialize'),
  sendChatMessage: (data) => api.post('/chat/message', data),
};

export default api;