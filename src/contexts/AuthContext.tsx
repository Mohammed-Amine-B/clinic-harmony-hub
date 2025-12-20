import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@clinic.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@clinic.com',
      name: 'Dr. Sarah Admin',
      role: 'admin',
      avatar: undefined,
      phone: '+1 234 567 890',
      createdAt: new Date(),
    },
  },
  'doctor@clinic.com': {
    password: 'doctor123',
    user: {
      id: '2',
      email: 'doctor@clinic.com',
      name: 'Dr. Michael Chen',
      role: 'doctor',
      avatar: undefined,
      phone: '+1 234 567 891',
      createdAt: new Date(),
    },
  },
  'patient@clinic.com': {
    password: 'patient123',
    user: {
      id: '3',
      email: 'patient@clinic.com',
      name: 'Emma Wilson',
      role: 'patient',
      avatar: undefined,
      phone: '+1 234 567 892',
      createdAt: new Date(),
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('clinic_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoUser = demoUsers[email.toLowerCase()];
    
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('clinic_user', JSON.stringify(demoUser.user));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    throw new Error('Invalid email or password');
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (demoUsers[email.toLowerCase()]) {
      setIsLoading(false);
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    localStorage.setItem('clinic_user', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('clinic_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
