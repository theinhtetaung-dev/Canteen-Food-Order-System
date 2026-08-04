import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getSessionUser,
  loginUser,
  registerUser,
  updateUserProfile,
} from "@furniture/api/auth.api";
import type {
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@furniture/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSessionUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const loggedIn = await loginUser(payload);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    // Redirect to furniture (default page)
    window.location.href = "/furniture";
  }, []);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload) => {
      if (!user) throw new Error("Not logged in");
      const updated = await updateUserProfile(user.id, payload);
      setUser(updated);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
