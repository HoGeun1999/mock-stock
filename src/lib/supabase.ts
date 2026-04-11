import { createClient } from "@supabase/supabase-js";

// .env 파일의 supabse url과 key 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL 또는 Anon Key가 .env 파일에 설정되지 않았습니다.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
