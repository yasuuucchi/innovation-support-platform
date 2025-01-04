import { create } from "zustand";

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      set({
        user: data.user,
        isAuthenticated: data.isAuthenticated,
      });
    } catch (error) {
      console.error("セッションの確認に失敗しました:", error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
