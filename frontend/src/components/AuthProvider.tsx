import React, { useState, useEffect, ReactNode } from 'react';
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout, 
  getCurrentUser, 
  isAuthenticated,
  refreshToken 
} from '../services/authService';
import { AuthContext, User, AuthProviderProps } from '../contexts/AuthContext';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        } else {
          // Try to refresh token
          try {
            await refreshToken();
            const userData = getCurrentUser();
            setUser(userData);
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

  const login = async (credentials: { username: string; password: string; rememberMe: boolean }) => {
    try {
      setIsLoading(true);
      const response = await authLogin(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; username: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await authRegister(userData);
      setUser(response.user);
    } catch (error) {
      console.log(error)
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};