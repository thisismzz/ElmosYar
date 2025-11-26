import React, { useState, useEffect, ReactNode } from 'react';
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout, 
  isAuthenticated,
  refreshToken
} from '../services/authService';
import { AuthContext, AuthProviderProps } from '../contexts/AuthContext';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isAuthenticated()) {
          try {
            await refreshToken();
          } catch (error) {
            // Refresh failed, user remains logged out
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

  const login = async (credentials: { username_or_email: string; password: string; rememberMe: boolean }) => {
    try {
      setIsLoading(true);
      await authLogin(credentials);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; username: string; password: string }) => {
    try {
      setIsLoading(true);
      await authRegister(userData);
    } catch (error) {
      console.log(error)
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogout();
  };

  const value = {
    isAuthenticated: isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};