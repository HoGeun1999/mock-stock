import React from "react";

interface Props {
  balance: number;
  holdingCount: number;
}

export const StockSummary = React.memo(({ balance, holdingCount }: Props) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
          Available Balance
        </span>
        <div className="mt-4">
          <span className="text-5xl font-black text-white">
            {balance?.toLocaleString() ?? 0}
          </span>
          <span className="ml-3 text-xl text-slate-500 font-bold">KRW</span>
        </div>
      </div>
      <div className="bg-blue-600 p-8 rounded-3xl shadow-lg flex flex-col justify-center">
        <p className="text-blue-100 text-sm font-bold opacity-80">
          보유 종목 수
        </p>
        <p className="text-4xl font-black text-white mt-1">{holdingCount} 건</p>
      </div>
    </section>
  );
});

StockSummary.displayName = "StockSummary";
