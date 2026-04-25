import React from "react";
import { HoldingItem } from "../HoldingItem";
import type { DisplayHolding } from "@/types/stock";

interface Props {
  items: DisplayHolding[];
  isLoading: boolean;
}

export const PortfolioSection = React.memo(({ items, isLoading }: Props) => {
  return (
    <section>
      <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-emerald-400">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        PORTFOLIO
      </h3>
      <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-2 min-h-[300px]">
        {items.length === 0 && !isLoading ? (
          <div className="py-20 text-center text-slate-600">
            보유 중인 주식이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {items.map((h) => (
              <HoldingItem key={h.symbol} holding={h} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

PortfolioSection.displayName = "PortfolioSection";
