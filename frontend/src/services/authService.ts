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
      (config.headers as any).Authorization = `Bearer ${token}`;
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

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry &&
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
        console.error('Token refresh failed:', refreshError);
        await logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

export const signup = async (userData: { username: string; email: string; password: string }) => {
  const response = await api.post('/signup/', userData);
  return response.data;
};

export const login = async (credentials: { username_or_email: string; password: string; rememberMe?: boolean }) => {
  const response = await api.post('/login/', credentials);
  // On success backend returns { success, message, user, tokens }
  if (response.data?.success && response.data?.tokens) {
    setToken(response.data.tokens.access);
    setRefreshToken(response.data.tokens.refresh);
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
  }
  return response.data;
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
  window.location.href = '/login';
};

export const verifyToken = async (token: string) => {
  const response = await api.post('/token/verify/', { token });
  return response.data;
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/token/refresh/', { refresh });
    const access = response.data?.access;
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

export const verifyEmail = async (uid: string) => {
  const response = await api.get(`/verify-email/${uid}/`);
  if (response.data?.tokens) {
    setToken(response.data.tokens.access);
    setRefreshToken(response.data.tokens.refresh);
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await api.post('/resend-verification-email/', { email });
  return response.data;
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