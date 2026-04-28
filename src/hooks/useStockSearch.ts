import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Suggestion {
  code: string;
  name: string;
}

export const useStockSearch = (term: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      const trimmed = term.trim();
      // 2글자 부터 검색
      if (trimmed.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      
      // name 또는 code에 입력값이 포함된 종목 5개 검색
      const { data, error } = await supabase
        .from("stocks")
        .select("code, name")
        .or(`name.ilike.%${trimmed}%,code.ilike.%${trimmed}%`)
        .limit(5);

      if (isMounted) {
        if (!error && data) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
        setIsSearching(false);
      }
    };

    // 300ms 디바운스 적용
    const timer = setTimeout(fetchSuggestions, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [term]);

  return { suggestions, isSearching };
};