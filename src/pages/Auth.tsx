import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. 회원가입
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname },
          },
        });
        if (error) throw error;
        alert("회원가입 성공! 이제 로그인해 주세요.");
        setIsSignUp(false);
        // Auth.tsx의 로그인 부분 수정
      } else {
        // 2. 로그인
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) throw authError;

        if (authData.user) {
          // profiles 테이블에서 데이터 가져오기
          // 팁: 여기서 데이터가 안 온다면 RLS 정책 문제일 가능성이 큽니다.
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("balance, nickname")
            .eq("id", authData.user.id)
            .maybeSingle(); // single() 대신 maybeSingle()로 에러 방지

          if (profileError) {
            console.error("프로필 조회 중 오류:", profileError.message);
          }

          // Zustand 스토어 저장
          login({
            id: authData.user.id,
            email: authData.user.email || "",
            nickname:
              profile?.nickname ||
              authData.user.user_metadata.nickname ||
              "익명",
            // 만약 profile이 null이면 기본값 10,000,000을 세팅 (방어 코드)
            balance: profile ? profile.balance : 10000000,
          });

          navigate("/");
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">
          {isSignUp ? "회원가입" : "모의투자 로그인"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="사용할 닉네임"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="이메일 주소"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold text-white transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading
              ? "처리 중..."
              : isSignUp
                ? "무료 가입하기"
                : "투자 시작하기"}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-sm text-gray-400 hover:text-blue-400 transition"
        >
          {isSignUp
            ? "이미 계정이 있으신가요? 로그인"
            : "계정이 없으신가요? 10초 만에 가입하기"}
        </button>
      </div>
    </div>
  );
}
