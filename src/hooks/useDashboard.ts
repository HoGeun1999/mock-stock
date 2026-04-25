import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { getCachedStockPrice } from "@/services/stockService";
import { useTrading } from "./useTrading";
import stockList from "@/data/stock.json";
import type { Stock, DisplayHolding } from "@/types/stock";

export const useDashboard = () => {
  const { user, updateBalance } = useAuthStore();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [myHoldings, setMyHoldings] = useState<DisplayHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isFetching = useRef(false);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /**
   * 앱 진입 시 또는 수동 새로고침 시 데이터 초기화 사용
   */
  const initDashboardData = useCallback(async () => {
    if (!user || isFetching.current) return;

    isFetching.current = true;
    setIsLoading(true);

    try {
      // 잔고 세팅
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) updateBalance(profile.balance);

      // 보유 종목 세팅
      const { data: holdings } = await supabase
        .from("holdings")
        .select("symbol, name, quantity, average_price")
        .eq("user_id", user.id)
        .gt("quantity", 0);

      if (!holdings || holdings.length === 0) {
        setMyHoldings([]);
        setStocks([]);
        return;
      }

      const updatedHoldings: DisplayHolding[] = [];
      const updatedStocks: Stock[] = [];

      // 보유 종목에 대해 순차적으로 ksi api 호출
      for (const h of holdings) {
        const data = await getCachedStockPrice(h.symbol, h.name);
        if (data && data.stck_prpr !== "0") {
          const currentPrice = parseInt(data.stck_prpr);
          const changeRate = parseFloat(data.prdy_ctrt);
          const profitRate =
            h.average_price > 0
              ? ((currentPrice - h.average_price) / h.average_price) * 100
              : 0;

          updatedHoldings.push({
            ...h,
            currentPrice,
            profitRate,
          } as DisplayHolding);
          updatedStocks.push({
            id: h.symbol,
            symbol: h.symbol,
            name: h.name,
            price: currentPrice,
            change: changeRate,
          });
        }
        await sleep(1200);
      }

      setMyHoldings(updatedHoldings);
      setStocks(updatedStocks);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [user?.id, updateBalance]);

  /**
   * 주기적 시세 업데이트 로직 (Polling)
   * 현재 리스트에 있는 종목들의 가격만 갱신
   */
  const updatePrices = useCallback(async () => {
    if (isFetching.current) return;

    console.log(
      "🔄 시세 업데이트 체크 시작...",
      new Date().toLocaleTimeString(),
    );

    const targets = [
      ...myHoldings.map((h) => ({ symbol: h.symbol })),
      ...stocks.map((s) => ({ symbol: s.symbol })),
    ];

    const uniqueSymbols = Array.from(new Set(targets.map((t) => t.symbol)));
    if (uniqueSymbols.length === 0) {
      console.log("⚠️ 업데이트할 종목이 없습니다.");
      return;
    }

    isFetching.current = true;

    for (const symbol of uniqueSymbols) {
      try {
        const data = await getCachedStockPrice(symbol);
        if (data && data.stck_prpr !== "0") {
          const currentPrice = parseInt(data.stck_prpr);
          const changeRate = parseFloat(data.prdy_ctrt);
          setMyHoldings((prev) =>
            prev.map((h) =>
              h.symbol === symbol
                ? {
                    ...h,
                    currentPrice,
                    profitRate:
                      h.average_price > 0
                        ? ((currentPrice - h.average_price) / h.average_price) *
                          100
                        : 0,
                  }
                : h,
            ),
          );

          setStocks((prev) =>
            prev.map((s) =>
              s.symbol === symbol
                ? { ...s, price: currentPrice, change: changeRate }
                : s,
            ),
          );
        }
      } catch (e) {
        console.error(`${symbol} 업데이트 실패`, e);
      }
      await sleep(1200);
    }
    isFetching.current = false;
  }, [myHoldings.length, stocks.length]); // 리스트의 개수가 바뀔 때만 함수 갱신

  /**
   * 검색 로직
   */
  const handleSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || isLoading) return;

      const found = stockList.find(
        (s) =>
          s.name === trimmedQuery ||
          s.code === trimmedQuery ||
          s.name.includes(trimmedQuery),
      );

      const targetCode = found
        ? found.code
        : /^\d{6}$/.test(trimmedQuery)
          ? trimmedQuery
          : "";
      const targetName = found ? found.name : `종목(${trimmedQuery})`;

      if (!targetCode) return alert("검색 결과가 없습니다.");

      setIsLoading(true);
      try {
        const data = await getCachedStockPrice(targetCode, targetName);
        if (data && data.stck_prpr !== "0") {
          setStocks((prev) => [
            {
              id: targetCode,
              symbol: targetCode,
              name: targetName,
              price: parseInt(data.stck_prpr),
              change: parseFloat(data.prdy_ctrt),
            },
            ...prev.filter((s) => s.symbol !== targetCode),
          ]);
        } else {
          alert("시세 정보를 가져올 수 없는 종목입니다.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  // 거래 로직 연결
  const { handleTrade } = useTrading(myHoldings, initDashboardData);

  // 초기 데이터 로드
  useEffect(() => {
    if (user?.id) initDashboardData();
  }, [user?.id, initDashboardData]);

  // 60초 주기 자동 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      updatePrices();
    }, 60000);
    return () => clearInterval(timer);
  }, [updatePrices]);

  return {
    user,
    stocks,
    myHoldings,
    isLoading,
    handleSearch,
    handleTrade,
    refreshData: initDashboardData,
  };
};
