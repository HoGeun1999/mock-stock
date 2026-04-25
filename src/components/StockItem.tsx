import React, { useState, useEffect, useRef } from "react";
import type { Stock } from "@/types/stock";

interface StockItemProps {
  stock: Stock;
  onTrade: (stock: Stock, type: "BUY" | "SELL") => void;
}

export const StockItem = React.memo(({ stock, onTrade }: StockItemProps) => {
  // 이전 가격을 저장하여 상승/하락 판단
  const prevPriceRef = useRef(stock.price);
  const [flashType, setFlashType] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevPriceRef.current === stock.price) return;

    // 상승/하락 판단
    if (stock.price > prevPriceRef.current) {
      setFlashType("up");
    } else if (stock.price < prevPriceRef.current) {
      setFlashType("down");
    }

    const timer = setTimeout(() => setFlashType(null), 800);

    prevPriceRef.current = stock.price;

    return () => clearTimeout(timer);
  }, [stock.price]);

  const getBgColor = () => {
    if (flashType === "up") return "bg-red-500/20 border-red-500/50";
    if (flashType === "down") return "bg-blue-500/20 border-blue-500/50";
    return "bg-slate-900 border-slate-800";
  };

  return (
    <div
      className={`p-6 rounded-3xl flex justify-between items-center hover:border-slate-600 transition-all duration-500 shadow-sm border ${getBgColor()}`}
    >
      <div className="flex-1">
        <h4 className="font-black text-xl text-white">{stock.name}</h4>
        <div className="flex items-center gap-4 mt-1">
          <span
            className={`text-sm font-bold px-2 py-0.5 rounded transition-colors duration-500 ${
              stock.change > 0
                ? "bg-red-500/10 text-red-400"
                : "bg-blue-500/10 text-blue-400"
            } ${flashType === "up" ? "text-red-200" : flashType === "down" ? "text-blue-200" : ""}`}
          >
            {stock.price.toLocaleString()}원 ({stock.change > 0 ? "+" : ""}
            {stock.change}%)
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onTrade(stock, "BUY")}
          className="bg-slate-800 hover:bg-red-500 text-white px-5 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
        >
          매수
        </button>
        <button
          onClick={() => onTrade(stock, "SELL")}
          className="bg-slate-800 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
        >
          매도
        </button>
      </div>
    </div>
  );
});

StockItem.displayName = "StockItem";
