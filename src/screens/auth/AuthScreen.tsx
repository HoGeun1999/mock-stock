// src/screens/auth/AuthScreen.tsx
import { useState } from "react";
import LoginForm from "../../sections/auth/LoginForm";
import SignUpForm from "../../sections/auth/SignUpForm";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">
          {isSignUp ? "회원가입" : "모의투자 로그인"}
        </h2>

        {isSignUp ? (
          <SignUpForm onSwitch={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onSwitch={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
}
