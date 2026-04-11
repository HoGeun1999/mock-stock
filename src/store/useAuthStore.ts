import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  nickname: string;
  balance: number;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (userData) =>
        set({
          user: userData,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
        }),

      updateBalance: (newBalance) =>
        set((state) => ({
          user: state.user ? { ...state.user, balance: newBalance } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
);
