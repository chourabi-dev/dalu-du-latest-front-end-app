import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getStoredToken, setStoredToken, ApiError } from "@/lib/api";
import type { User } from "@/types/ordering";

interface AuthContextType {
  user: User | null;
  isLoadingUser: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  // Controls the auth modal that gates checkout.
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const hydrateFromToken = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsLoadingUser(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch (err) {
      // Token expired/invalid — clear it silently.
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromToken();
  }, [hydrateFromToken]);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    setStoredToken(token);
    setUser(user);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user, token } = await authApi.register(name, email, password);
    setStoredToken(token);
    setUser(user);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (idToken: string) => {
    const { user, token } = await authApi.google(idToken);
    setStoredToken(token);
    setUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUser,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { ApiError };
