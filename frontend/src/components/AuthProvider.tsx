import React, { useState, useEffect, ReactNode } from 'react';
import {
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  isAuthenticated,
  refreshToken as authRefreshToken,
  verifyToken as authVerifyToken,
  verifyEmail as authVerifyEmail,
  resendVerificationEmail as authResendVerificationEmail,
} from '../services/authService';
import { AuthContext, AuthProviderProps, User } from '../contexts/AuthContext';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isAuthenticated()) {
          try {
            const newAccess = await authRefreshToken();
            if (newAccess) {
              const stored = localStorage.getItem('userData');
              if (stored) setUser(JSON.parse(stored));
            }
          } catch (error) {
            // Refresh failed, user remains logged out
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { username_or_email: string; password: string; rememberMe?: boolean }) => {
    try {
      setIsLoading(true);
      const data = await authLogin(credentials);
      if (data?.user) setUser(data.user);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; username: string; password: string }) => {
    try {
      setIsLoading(true);
      const data = await authSignup(userData);
      if (data?.user) setUser(data.user);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const verifyToken = async (token: string) => {
    return authVerifyToken(token);
  };

  const refreshToken = async () => {
    return authRefreshToken();
  };

  const verifyEmail = async (uid: string) => {
    const data = await authVerifyEmail(uid);
    if (data?.user) setUser(data.user);
    return data;
  };

  const resendVerificationEmail = async (email: string) => {
    return authResendVerificationEmail(email);
  };

  const value = {
    isAuthenticated: isAuthenticated(),
    isLoading,
    user,
    login,
    register,
    logout,
    verifyToken,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};