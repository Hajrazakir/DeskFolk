import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, login as loginFn, signup as signupFn, logout as logoutFn, type User } from "@/lib/auth";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const login = (email: string, password: string) => {
    const result = loginFn(email, password);
    if (result.success) setUser(getCurrentUser());
    return result;
  };

  const signup = (name: string, email: string, password: string) => {
    const result = signupFn(name, email, password);
    if (result.success) setUser(getCurrentUser());
    return result;
  };

  const logout = () => {
    logoutFn();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}