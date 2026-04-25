import React from "react";
import { StockItem } from "../StockItem";
import type { Stock } from "@/types/stock";

interface StockListProps {
  items: Stock[];
  onTrade: (stock: Stock, type: "BUY" | "SELL") => void;
  isLoading: boolean;
}

export const StockList = React.memo(
  ({ items, onTrade, isLoading }: StockListProps) => {
    return (
      <section>
        <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-blue-400">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          EXCHANGE
        </h3>
        <div className="space-y-4">
          {/* 데이터가 없을 때 */}
          {items.length === 0 && !isLoading && (
            <p className="text-center py-20 text-slate-600">
              거래 가능한 종목을 검색해보세요.
            </p>
          )}

          {items.map((stock) => (
            <StockItem key={stock.symbol} stock={stock} onTrade={onTrade} />
          ))}

          {/* 로딩 바 */}
          {isLoading && (
            <div className="text-center py-8 text-slate-500 animate-pulse font-bold bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              데이터 동기화 중...
            </div>
          )}
        </div>
      </section>
    );
  },
);

StockList.displayName = "StockList";
