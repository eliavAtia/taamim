import React, { createContext, useContext, useState, ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  totalXp: number;
  hearts: number;
  streak: number;
  createdAt?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          data?.message && typeof data.message === 'string'
            ? data.message
            : Array.isArray(data?.message)
            ? data.message[0]
            : response.status === 401
            ? 'אימייל או סיסמה שגויים'
            : 'שגיאה בהתחברות למערכת';
        return { success: false, error: errorMsg };
      }

      if (data?.accessToken && data?.user) {
        setToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'תגובה לא תקינה מהשרת' };
    } catch (err: any) {
      return {
        success: false,
        error: 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל ושיש חיבור לרשת.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          displayName: displayName.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          data?.message && typeof data.message === 'string'
            ? data.message
            : Array.isArray(data?.message)
            ? data.message[0]
            : response.status === 409
            ? 'משתמש עם אימייל זה כבר קיים'
            : 'שגיאה בהרשמה למערכת';
        return { success: false, error: errorMsg };
      }

      if (data?.accessToken && data?.user) {
        setToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'תגובה לא תקינה מהשרת' };
    } catch (err: any) {
      return {
        success: false,
        error: 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל ושיש חיבור לרשת.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
