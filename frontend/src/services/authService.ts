import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/accounts/login/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
};

export const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
};

// Auth functions
export const login = async (credentials: { username: string; password: string; rememberMe?: boolean }) => {
  const response = await api.post('/accounts/login/', credentials);
  
  if (response.data.accessToken) {
    setToken(response.data.accessToken);
    setRefreshToken(response.data.refreshToken);
    
    // Store user data if provided
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
  }
  
  return response.data;
};

export const register = async (userData: { 
  email: string; 
  username: string; 
  password: string; 
}) => {
  const response = await api.post('/accounts/signup/', userData);
  
  if (response.data.accessToken) {
    setToken(response.data.accessToken);
    setRefreshToken(response.data.refreshToken);
    
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
  }
  
  return response.data;
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/accounts/token/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;
    if (accessToken) {
      setToken(accessToken);
      return accessToken;
    }

    return null;
  } catch (error) {
    removeTokens();
    throw error;
  }
};

export const logout = (): void => {
  removeTokens();
};

export const getCurrentUser = (): any => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export default api;