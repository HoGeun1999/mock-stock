import React from "react";
import type { DisplayHolding } from "@/types/stock";

interface HoldingItemProps {
  holding: DisplayHolding;
}

export const HoldingItem = React.memo(({ holding }: HoldingItemProps) => {
  return (
    <div className="p-5 hover:bg-slate-800/30 transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-white text-lg">{holding.name}</p>
          <p className="text-xs text-slate-500 font-mono">{holding.symbol}</p>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-bold ${holding.profitRate >= 0 ? "text-red-400" : "text-blue-400"}`}
          >
            {holding.profitRate >= 0 ? "▲" : "▼"}{" "}
            {holding.profitRate.toFixed(2)}%
          </p>
          <p className="text-2xl font-black text-white">
            {holding.quantity} 주
          </p>
        </div>
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-400 border-t border-slate-800/50 pt-2">
        <span>평단: {holding.average_price?.toLocaleString()}원</span>
        <span>현재가: {holding.currentPrice?.toLocaleString()}원</span>
      </div>
    </div>
  );
});

HoldingItem.displayName = "HoldingItem";
