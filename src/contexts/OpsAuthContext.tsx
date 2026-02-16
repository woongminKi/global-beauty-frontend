'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OpsUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
}

interface OpsAuthContextType {
  user: OpsUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const OpsAuthContext = createContext<OpsAuthContextType | undefined>(undefined);

export function OpsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OpsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/v1/ops/auth/me`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/v1/ops/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/v1/ops/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
    setUser(null);
  };

  return (
    <OpsAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </OpsAuthContext.Provider>
  );
}

export function useOpsAuth() {
  const context = useContext(OpsAuthContext);
  if (context === undefined) {
    throw new Error('useOpsAuth must be used within an OpsAuthProvider');
  }
  return context;
}
