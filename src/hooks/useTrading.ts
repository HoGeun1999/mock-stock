import { useAuthStore } from "@/store/useAuthStore";
import { calculateTradeData } from "@/utils/tradeCalculator";
import { updateTradeDB } from "@/services/tradeService";
import { getStockPrice } from "@/services/kisApi";
import type { Stock, Holding, DisplayHolding } from "@/types/stock";

export const useTrading = (
  myHoldings: DisplayHolding[],
  refreshAllData: () => Promise<void>,
) => {
  const { user, updateBalance } = useAuthStore();

  const handleTrade = async (stock: Stock, type: "BUY" | "SELL") => {
    if (!user) return;

    try {
      // 구매 직전 실시간 시세 한 번 더 확인
      const latestData = await getStockPrice(stock.symbol);
      if (!latestData || latestData.stck_prpr === "0") {
        return alert("실시간 시세를 가져올 수 없어 거래가 불가능합니다.");
      }

      const realTimePrice = parseInt(latestData.stck_prpr);

      // 매수/매도량 입력 받기
      const promptMsg = `[현재가: ${realTimePrice.toLocaleString()}원]\n${stock.name}을(를) 몇 주 ${type === "BUY" ? "매수" : "매도"}하시겠습니까?`;
      const inputQty = prompt(promptMsg, "1");
      const tradeQty = Math.floor(Number(inputQty));

      if (!inputQty || isNaN(tradeQty) || tradeQty <= 0) return;

      // 현재 데이터 준비
      const holding = myHoldings.find((h) => h.symbol === stock.symbol);
      const currentQty = holding?.quantity || 0;
      const currentAvgPrice = holding?.average_price || 0;

      const { newBalance, newQty, newAvgPrice, totalPrice } =
        calculateTradeData(
          type,
          tradeQty,
          realTimePrice,
          currentQty,
          currentAvgPrice,
          user.balance,
        );

      // 검증
      if (type === "BUY" && newBalance < 0) {
        return alert(
          `잔고가 부족합니다!\n필요 금액: ${totalPrice.toLocaleString()}원\n내 잔고: ${user.balance.toLocaleString()}원`,
        );
      }
      if (type === "SELL" && currentQty < tradeQty) {
        return alert(`보유 수량이 부족합니다!\n현재 보유: ${currentQty}주`);
      }

      // DB 업데이트
      // stock 객체의 price도 최신가로 업데이트해서 넘김
      const updatedStock = { ...stock, price: realTimePrice };
      await updateTradeDB(
        user.id,
        updatedStock,
        newBalance,
        newQty,
        newAvgPrice,
      );

      // 성공 후 액션
      updateBalance(newBalance);
      await refreshAllData();
      alert(
        `${stock.name} ${tradeQty}주 ${type === "BUY" ? "매수" : "매도"} 완료!`,
      );
    } catch (error) {
      console.error("Trade Error:", error);
      alert("거래 중 에러가 발생했습니다.");
    }
  };

  return { handleTrade };
};
