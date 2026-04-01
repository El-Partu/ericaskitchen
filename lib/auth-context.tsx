// 📁 lib/auth-context.tsx

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { get, post, ApiError } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types — matching GET /auth/me response shape exactly
// ---------------------------------------------------------------------------

export interface UserRole {
  _id: string;
  name: string;
  permissions: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  authMethod: "local" | "google" | "apple";
  role: UserRole;
  phoneNumber?: string;
  avatar: string | null;
  emailVerified: boolean;
  addresses: string[];
  defaultAddress?: string;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Request / Response payload types
// ---------------------------------------------------------------------------

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phoneNumber?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthMeResponse {
  status: string;
  data: { user: User };
}

interface SignupResponse {
  status: string;
  message: string;
  data: { user: User };
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // true while the initial /auth/me check is in flight
  isAuthenticated: boolean;
  isAdmin: boolean; // true if role.name is an admin/staff role
  isSuperAdmin: boolean; // true only for role.name === super_admin
  hasPermission: (permission: string) => boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<User>;
  appleLogin: (identityToken: string, user?: AppleUser) => Promise<void>;
  refreshUser: () => Promise<void>; // re-fetches /auth/me — useful after profile updates
}

interface AppleUser {
  name?: { firstName?: string; lastName?: string };
  email?: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch the current user — called on mount and after profile updates
  const fetchUser = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await get<AuthMeResponse>("/auth/me", {
        signal,
        timeout: 8_000,
      });
      setUser(response.data.user);
    } catch (error) {
      if (error instanceof Error && error.name === "CanceledError") {
        return;
      }

      // 401 means no valid session — that's expected for logged-out users
      if (error instanceof ApiError && error.statusCode === 401) {
        setUser(null);
      } else {
        // Unexpected error — still clear the user so the UI stays consistent
        setUser(null);
        console.error("[AuthContext] Failed to fetch user:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: check if a session already exists (cookie may still be valid)
  useEffect(() => {
    const controller = new AbortController();
    fetchUser(controller.signal);

    return () => controller.abort();
  }, [fetchUser]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    // POST /auth/login sets cookies automatically — no token in response body
    await post("/auth/login", payload);
    // Read user directly so callers can safely route based on role.
    const response = await get<AuthMeResponse>("/auth/me", {
      timeout: 8_000,
    });
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<User> => {
    await post<SignupResponse>("/auth/signup", payload);
    // Read user from /auth/me so role/permissions are normalized.
    const response = await get<AuthMeResponse>("/auth/me", {
      timeout: 8_000,
    });
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await post("/auth/logout");
    } finally {
      // Always clear local state even if the request fails
      setUser(null);
      router.push("/");
    }
  }, [router]);

  const googleLogin = useCallback(async (idToken: string): Promise<User> => {
    await post("/auth/google", { idToken });
    const response = await get<AuthMeResponse>("/auth/me", {
      timeout: 8_000,
    });
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const appleLogin = useCallback(
    async (identityToken: string, appleUser?: AppleUser) => {
      await post("/auth/apple", { identityToken, user: appleUser });
      await fetchUser();
    },
    [fetchUser],
  );

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const isAuthenticated = user !== null;

  const roleName = user?.role?.name?.toLowerCase();
  const isAdmin =
    isAuthenticated &&
    Boolean(roleName && ["admin", "super_admin", "staff"].includes(roleName));
  const isSuperAdmin = isAuthenticated && roleName === "super_admin";

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.role.permissions.includes(permission);
    },
    [user],
  );

  // ── Context value (memoized to prevent unnecessary re-renders) ────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      hasPermission,
      login,
      signup,
      logout,
      googleLogin,
      appleLogin,
      refreshUser,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      hasPermission,
      login,
      signup,
      logout,
      googleLogin,
      appleLogin,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
