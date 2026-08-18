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
} from "@user/api/auth.api";
import { LogOut, X } from "lucide-react";
import type {
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@user/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
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

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const registered = await registerUser(payload);
    setUser(registered);
    return registered;
  }, []);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsLogoutModalOpen(false);
    window.location.href = "/user";
  }, []);

  const logout = useCallback(() => {
    setIsLogoutModalOpen(true);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6 animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold">
                <LogOut className="w-5 h-5 text-red-500" />
                <h2 className="text-lg">Confirm Logout</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="bg-[#C5221F] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#A81B18] transition-colors shadow-sm cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
