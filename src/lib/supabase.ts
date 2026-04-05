import { createClient } from "@supabase/supabase-js";

// .env 파일에 적어둔 주소와 키를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 값이 비어있으면 에러를 띄워 개발자가 알 수 있게 합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL 또는 Anon Key가 .env 파일에 설정되지 않았습니다.",
  );
}

// 이 'supabase' 객체를 통해 DB 조회, 로그인 등을 수행합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
