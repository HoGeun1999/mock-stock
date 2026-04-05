import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabase";

// 가상 주식 데이터 타입
interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

export default function Dashboard() {
  const { user, logout, updateBalance } = useAuthStore();
  const [stocks, setStocks] = useState<Stock[]>([
    { id: "1", name: "삼성전자", symbol: "005930", price: 72500, change: 1.2 },
    {
      id: "2",
      name: "SK하이닉스",
      symbol: "000660",
      price: 118000,
      change: -0.5,
    },
    { id: "3", name: "에코프로", symbol: "086520", price: 640000, change: 4.8 },
    { id: "4", name: "애플", symbol: "AAPL", price: 245000, change: 0.8 },
  ]);

  // DB에서 최신 잔고 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        updateBalance(data.balance);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">
            {user?.nickname}님의 투자 지갑
          </h1>
          <p className="text-gray-400">오늘도 성투하세요! 🚀</p>
        </div>
        <button
          onClick={logout}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
        >
          로그아웃
        </button>
      </div>

      {/* 자산 카드 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl mb-10">
        <span className="text-blue-100 text-sm">보유 예수금</span>
        <h2 className="text-4xl font-black mt-2">
          {user?.balance.toLocaleString()}{" "}
          <span className="text-xl font-normal">KRW</span>
        </h2>
      </div>

      {/* 주식 리스트 */}
      <div>
        <h3 className="text-xl font-semibold mb-4">관심 종목</h3>
        <div className="grid gap-4">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="bg-gray-800 p-5 rounded-xl flex justify-between items-center hover:bg-gray-750 border border-gray-700 transition cursor-pointer"
            >
              <div>
                <div className="font-bold text-lg">{stock.name}</div>
                <div className="text-gray-500 text-sm">{stock.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">
                  {stock.price.toLocaleString()}원
                </div>
                <div
                  className={`text-sm ${stock.change > 0 ? "text-red-400" : "text-blue-400"}`}
                >
                  {stock.change > 0 ? "▲" : "▼"} {Math.abs(stock.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
