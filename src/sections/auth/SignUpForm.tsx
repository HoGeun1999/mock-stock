// src/sections/auth/SignUpForm.tsx
import { useState } from "react";
import { useAuthMutation } from "../../hooks/auth/useAuthMutation";

interface Props {
  onSwitch: () => void;
}

export default function SignUpForm({ onSwitch }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const { isLoading, signUp } = useAuthMutation();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, nickname, onSwitch);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="text"
          placeholder="사용할 닉네임"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
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
          autoComplete="new-password"
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
          {isLoading ? "처리 중..." : "무료 가입하기"}
        </button>
      </form>

      <div className="pt-2 text-center">
        <button
          onClick={onSwitch}
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          이미 계정이 있으신가요? <span className="underline">로그인</span>
        </button>
      </div>
    </div>
  );
}
