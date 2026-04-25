// @/services/stockService.ts
import { supabase } from "@/lib/supabase";
import { getStockPrice } from "./kisApi";

// 지연 함수
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * KIS API 호출 재시도 로직
 */
const fetchWithRetry = async (symbol: string, retries = 3, backoff = 1500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await getStockPrice(symbol);

      // 정상적인 데이터가 왔을 때만 반환
      if (data && data.stck_prpr !== "0") {
        return data;
      }

      // 데이터가 오긴 했지만 값이 없는 경우
      throw new Error("Invalid Data");
    } catch (error) {
      const isLastRetry = i === retries - 1;
      if (isLastRetry) {
        console.error(`[${symbol}] 최종 호출 실패:`, error);
        return null;
      }

      // 재시도 전 대기 (실패할수록 더 오래 대기)
      const waitTime = backoff * (i + 1);
      console.warn(
        `[${symbol}] 호출 실패. ${waitTime}ms 후 재시도... (${i + 1}/${retries})`,
      );
      await delay(waitTime);
    }
  }
  return null;
};

/**
 * 최근 1분안에 검색한적 있는 주식 DB에서 캐싱된 값 가져오기
 */
export const getCachedStockPrice = async (symbol: string, name?: string) => {
  // DB 캐시 확인
  const { data: cached } = await supabase
    .from("stock_quotes")
    .select("*")
    .eq("symbol", symbol)
    .maybeSingle();

  const now = new Date();
  const cacheLimit = 60 * 1000; // 임의설정 (1분)

  if (
    cached &&
    now.getTime() - new Date(cached.updated_at).getTime() < cacheLimit
  ) {
    return {
      stck_prpr: cached.current_price.toString(),
      prdy_ctrt: cached.change_rate.toString(),
      isCached: true,
    };
  }

  // 캐시된 값이 없거나 만료 시 재시도 로직 및 API 호출
  const freshData = await fetchWithRetry(symbol);

  if (freshData) {
    const finalName = name || cached?.name || `종목(${symbol})`;

    // DB 업데이트
    await supabase.from("stock_quotes").upsert({
      symbol,
      name: finalName,
      current_price: parseInt(freshData.stck_prpr),
      change_rate: parseFloat(freshData.prdy_ctrt),
      updated_at: new Date().toISOString(),
    });

    return { ...freshData, isCached: false };
  }

  // API 최종 실패 시 기존 캐시라도 반환 (빈값에 대한 방어코드)
  return cached
    ? {
        stck_prpr: cached.current_price.toString(),
        prdy_ctrt: cached.change_rate.toString(),
        isOld: true,
      }
    : null;
};
