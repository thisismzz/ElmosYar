import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://89.106.206.119:8000/api';

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

    if (
  error.response?.status === 401 && !originalRequest._retry &&
    (
      error.response?.code === "AUTH_TOKEN_INVALID" ||
      error.response?.code === "AUTH_TOKEN_EXPIRED" ||
      error.response?.code === "AUTH_TOKEN_MISSING"
    )
  ) {
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

export const removeTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userData');
};

// Auth functions
export const login = async (credentials: { username_or_email: string; password: string; rememberMe: boolean }) => {
  const response = await api.post('/login/', credentials);
  
  if (response.data.success === true && response.data.tokens) {
    setToken(response.data.tokens.access);
    setRefreshToken(response.data.tokens.refresh);
  }
  
  return response.data;
};

export const register = async (userData: { 
  email: string; 
  username: string; 
  password: string; 
}) => {
  const response = await api.post('/signup/', userData);
  
  if (response.data.error === false && response.data.data) {
    setToken(response.data.data.access);
    setRefreshToken(response.data.data.refresh);
  }
  
  return response.data;
};

// Token refresh function
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/token/refresh/', {
      refresh,
    });

    // UPDATED: Access token is directly in response.data
    const { access } = response.data;
    if (access) {
      setToken(access);
      return access;
    }

    return null;
  } catch (error) {
    removeTokens();
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  const refreshTokenValue = getRefreshToken();
  if (refreshTokenValue) {
    try {
      await api.post('/logout/', {
        refresh: refreshTokenValue,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  removeTokens();
  window.location.href = '/Login';
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export default api;