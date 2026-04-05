import { create } from "zustand";
import { persist } from "zustand/middleware";

// 1. 사용자 정보 타입 정의
interface User {
  id: string;
  email: string;
  nickname: string;
  balance: number; // 초기 자산 (예: 10,000,000원)
}

// 2. 스토어의 상태(State)와 액션(Action) 타입 정의
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  // 로그인 성공 시 호출
  login: (userData: User) => void;
  // 로그아웃 시 호출
  logout: () => void;
  // 주식 매수/매도 시 잔고 업데이트용
  updateBalance: (newBalance: number) => void;
}

// 3. Zustand 스토어 생성
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
      name: "auth-storage", // 로컬 스토리지에 저장될 키 이름
    },
  ),
);
