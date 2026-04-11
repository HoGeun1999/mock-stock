// src/hooks/auth/useAuthMutation.ts
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/hooks/common/useLoading";

export function useAuthMutation() {
  const { isLoading, withLoading } = useLoading();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    await withLoading(async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) throw authError;

        if (authData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("balance, nickname")
            .eq("id", authData.user.id)
            .maybeSingle();

          login({
            id: authData.user.id,
            email: authData.user.email || "",
            nickname:
              profile?.nickname ||
              authData.user.user_metadata.nickname ||
              "익명",
            balance: profile ? profile.balance : 10000000,
          });

          navigate("/");
        }
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    onSuccess: () => void,
  ) => {
    await withLoading(async () => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nickname } },
        });

        if (error) throw error;

        alert("회원가입 성공");
        onSuccess();
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  return { isLoading, signIn, signUp };
}
