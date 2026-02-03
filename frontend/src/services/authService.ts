import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8081/api';

// Note: Access token is stored in localStorage for persistence
// Refresh token is managed by the backend via HttpOnly cookies
// The browser automatically sends the refresh cookie with requests to the API
// We cannot and should not access the refresh token from JavaScript for security reasons

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-origin requests
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
      error.response?.data?.code === "token_not_valid"
    ) {
      originalRequest._retry = true;
      try {
        localStorage.removeItem('access');
        const newToken = await refreshToken();
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getToken = (): string | null => {
  return localStorage.getItem('access');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access', token);
};

export const removeTokens = (): void => {
  localStorage.removeItem('access');
  localStorage.removeItem('userData');
  // Note: HttpOnly refresh_token cookie will be cleared by the backend on logout
};

export const signup = async (userData: { username: string; email: string; password: string }) => {
  const response = await api.post('/signup/', userData);
  return response.data;
};

export const login = async (credentials: { username_or_email: string; password: string; rememberMe?: boolean }) => {
  const response = await api.post('/login/', credentials);
  if (response.data?.success && response.data?.access) {
    setToken(response.data.access);
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    // Backend will read refresh_token from HttpOnly cookie automatically
    await api.post('/logout/', {});
  } catch (error) {
    console.error('Logout error:', error);
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
    // Backend will read refresh_token from HttpOnly cookie automatically
    const response = await api.post('/token/refresh/', {});
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
  // Backend also sets refresh_token as HttpOnly cookie
  if (response.data?.tokens) {
    setToken(response.data.tokens.access);
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

export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/password-reset/request/', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
  const response = await api.post(`/password-reset/${token}/`, { 
    password, 
    password_confirm: passwordConfirm 
  });
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