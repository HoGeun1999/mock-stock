import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabase";
import { getStockPrice } from "../services/kisApi";

// --- 타입 정의 ---
interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
}

export default function Dashboard() {
  const { user, logout, updateBalance } = useAuthStore();

  // 1. 시장 종목 상태 (실시간 데이터를 담을 공간)
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [myHoldings, setMyHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard.tsx 내부

  // 헬퍼 함수: 지정된 밀리초만큼 대기
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchMarketData = async () => {
    const symbols = [
      { id: "1", name: "삼성전자", symbol: "005930" },
      { id: "2", name: "SK하이닉스", symbol: "000660" },
      { id: "3", name: "에코프로", symbol: "086520" },
      { id: "4", name: "현대차", symbol: "005380" },
    ];

    try {
      const updatedStocks = [];

      // ❌ 기존: Promise.all (동시 요청 -> 초당 제한 걸림)
      // ✅ 수정: for...of 루프 (순차 요청 + 0.5초 간격)
      for (const item of symbols) {
        const data = await getStockPrice(item.symbol);

        updatedStocks.push({
          ...item,
          price: data ? parseInt(data.stck_prpr) : 0,
          change: data ? parseFloat(data.prdy_ctrt) : 0,
        });

        // KIS 초당 제한(2건)을 피하기 위해 0.51초 대기
        await sleep(700);
      }

      setStocks(updatedStocks);
    } catch (error) {
      console.error("마켓 데이터 로드 실패:", error);
    }
  };

  // 3. 데이터 새로고침 (DB 동기화)
  const refreshAllData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      updateBalance(profile.balance);
    }

    const { data: holdings } = await supabase
      .from("holdings")
      .select("symbol, name, quantity")
      .eq("user_id", user.id)
      .gt("quantity", 0);

    if (holdings) {
      setMyHoldings(holdings);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      // 1. 사용자 자산 및 보유 주식 정보 먼저 가져오기
      await refreshAllData();
      // 2. 그 다음 실시간 마켓 데이터 가져오기 (이 안에서 토큰 발급이 일어남)
      await fetchMarketData();
      setIsLoading(false);
    };

    initDashboard();

    // 3. (선택 사항) 1분마다 시세 자동 갱신
    const timer = setInterval(() => {
      fetchMarketData();
    }, 60000); // 60초

    return () => clearInterval(timer);
  }, [user?.id]);
  // 매수 로직
  const handleBuy = async (stock: Stock) => {
    if (!user) return;
    if (user.balance < stock.price) {
      alert("잔액이 부족합니다!");
      return;
    }

    const newBalance = user.balance - stock.price;
    const currentQty =
      myHoldings.find((h) => h.symbol === stock.symbol)?.quantity || 0;

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (pErr) return alert("잔고 업데이트 실패");

    const { error: hErr } = await supabase.from("holdings").upsert(
      {
        user_id: user.id,
        symbol: stock.symbol,
        name: stock.name,
        quantity: currentQty + 1,
      },
      { onConflict: "user_id, symbol" },
    );

    if (!hErr) {
      updateBalance(newBalance);
      await refreshAllData();
      alert(`${stock.name} 1주 매수 완료!`);
    }
  };

  // 매도 로직
  const handleSell = async (stock: Stock) => {
    const holding = myHoldings.find((h) => h.symbol === stock.symbol);
    if (!user || !holding || holding.quantity <= 0) {
      alert("보유 수량이 없습니다!");
      return;
    }

    const newBalance = user.balance + stock.price;

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (pErr) return alert("매도 실패(잔고 업데이트 오류)");

    const { error: hErr } = await supabase.from("holdings").upsert(
      {
        user_id: user.id,
        symbol: stock.symbol,
        name: stock.name,
        quantity: holding.quantity - 1,
      },
      { onConflict: "user_id, symbol" },
    );

    if (!hErr) {
      updateBalance(newBalance);
      await refreshAllData();
      alert(`${stock.name} 1주 매도 완료!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">
            {user?.nickname}님의 투자 지갑
          </h1>
          <p className="text-gray-400">실시간 시세를 확인하고 투자하세요! 📈</p>
        </div>
        <button
          onClick={logout}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
        >
          로그아웃
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl mb-10">
        <span className="text-blue-100 text-sm">보유 예수금</span>
        <h2 className="text-4xl font-black mt-2">
          {user?.balance.toLocaleString()}{" "}
          <span className="text-xl font-normal">KRW</span>
        </h2>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-green-400">
          내 포트폴리오
        </h3>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          {myHoldings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              보유한 주식이 없습니다.
            </p>
          ) : (
            myHoldings.map((h) => (
              <div
                key={h.symbol}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0"
              >
                <div>
                  <span className="font-bold">{h.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{h.symbol}</span>
                </div>
                <span className="font-bold text-blue-400">{h.quantity} 주</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">실시간 시장 종목</h3>
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            시세를 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid gap-4">
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className="bg-gray-800 p-5 rounded-xl flex justify-between items-center border border-gray-700 hover:border-blue-500 transition"
              >
                <div>
                  <div className="font-bold text-lg">{stock.name}</div>
                  <div className="text-gray-500 text-sm">{stock.symbol}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="font-mono text-lg">
                      {stock.price.toLocaleString()}원
                    </div>
                    <div
                      className={`text-sm ${stock.change > 0 ? "text-red-400" : "text-blue-400"}`}
                    >
                      {stock.change > 0 ? "▲" : "▼"} {Math.abs(stock.change)}%
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuy(stock)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg font-bold text-sm transition"
                    >
                      매수
                    </button>
                    <button
                      onClick={() => handleSell(stock)}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg font-bold text-sm transition"
                    >
                      매도
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
