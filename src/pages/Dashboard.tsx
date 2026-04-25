import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/useAuthStore";
import { StockSummary } from "@/components/dashboard/stockSummary";
import { SearchSection } from "@/components/dashboard/searchSection";
import { PortfolioSection } from "@/components/dashboard/portfolio";
import { StockList } from "@/components/dashboard/stockList";
import { Footer } from "@/components/layout/footer";
export default function Dashboard() {
  const { logout } = useAuthStore();
  const { user, stocks, myHoldings, isLoading, handleSearch, handleTrade } =
    useDashboard();

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MOCK-INVEST
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {user?.nickname}님의 실시간 투자 대시보드
          </p>
        </div>
        <button onClick={logout} className="...">
          LOGOUT
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <StockSummary
          balance={user?.balance || 0}
          holdingCount={myHoldings.length}
        />

        <SearchSection onSearch={handleSearch} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <PortfolioSection items={myHoldings} isLoading={isLoading} />
          <StockList
            items={stocks}
            onTrade={handleTrade}
            isLoading={isLoading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
