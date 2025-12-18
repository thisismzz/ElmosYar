import React, { createContext, useContext, ReactNode } from 'react';

export interface User {
  id: number | string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  bio?: string | null;
  student_id?: string | null;
  is_email_verified?: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username_or_email: string; password: string; rememberMe?: boolean }) => Promise<any>;
  register: (userData: { email: string; username: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  verifyToken: (token: string) => Promise<any>;
  refreshToken: () => Promise<string | null>;
  verifyEmail: (uid: string) => Promise<any>;
  resendVerificationEmail: (email: string) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};