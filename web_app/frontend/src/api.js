import axios from 'axios'
import { useAuthStore } from './store'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (email, password, fullName) =>
    api.post('/auth/register', {
      email,
      password,
      full_name: fullName
    }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (profileData) =>
    api.put('/auth/profile', profileData),
}

// Analysis API
export const analysisAPI = {
  uploadAndPredict: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/analysis/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  getHistory: (limit = 20) =>
    api.get('/analysis/history', { params: { limit } }),
  
  getAnalysisDetails: (analysisId) =>
    api.get(`/analysis/analysis/${analysisId}`),
  
  deleteAnalysis: (analysisId) =>
    api.delete(`/analysis/analysis/${analysisId}`),
  
  clearAllHistory: () =>
    api.delete('/analysis/history'),
  
  getImage: (filename) =>
    `${API_BASE_URL}/analysis/image/${filename}`,
  
  downloadReport: (analysisId) => {
    return api.get(`/analysis/report/${analysisId}/pdf`, {
      responseType: 'blob'
    })
  }
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (days = 30) =>
    api.get('/analytics/dashboard', { params: { days } }),
  
  getComparisonMetrics: () =>
    api.get('/analytics/comparison')
}

export default api
