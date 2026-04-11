// src/sections/auth/LoginForm.tsx
import { useState } from "react";
import { useAuthMutation } from "../../hooks/auth/useAuthMutation";

interface Props {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isLoading, signIn } = useAuthMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    await signIn(email, password);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="이메일 주소"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-3 rounded-lg font-bold text-white transition ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 shadow-lg active:scale-[0.98]"
          }`}
        >
          {isLoading ? "처리 중..." : "투자 시작하기"}
        </button>
      </form>

      <div className="pt-2">
        <button
          onClick={onSwitch}
          className="w-full text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          계정이 없으신가요?{" "}
          <span className="underline">10초 만에 가입하기</span>
        </button>
      </div>
    </div>
  );
}
