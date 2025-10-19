import React, { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/v2/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("userCache");
  };

  const refreshAuth = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/v2/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      localStorage.removeItem("authToken");
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    user,
    isLoggedIn,
    isAdmin: user?.isAdmin || false,
    isLoading,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
