"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void; // Added login function
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for the token in localStorage
    const token = localStorage.getItem('sb_admin_token');
    if (token) {
      // In a real app, you'd also want to verify the token's expiry with the server
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => { // Implemented login function
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('sb_admin_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = { isAuthenticated, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
