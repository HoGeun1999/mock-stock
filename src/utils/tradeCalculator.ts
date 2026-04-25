/**
 * 매수/매도 후의 잔고, 수량, 평단을 계산하는 순수 함수
 */
export const calculateTradeData = (
  type: "BUY" | "SELL",
  tradeQty: number,
  stockPrice: number,
  currentQty: number,
  currentAvgPrice: number,
  currentBalance: number,
) => {
  const totalPrice = stockPrice * tradeQty;
  const newBalance =
    type === "BUY" ? currentBalance - totalPrice : currentBalance + totalPrice;
  const newQty = type === "BUY" ? currentQty + tradeQty : currentQty - tradeQty;

  let newAvgPrice = currentAvgPrice;
  if (type === "BUY") {
    const totalCost = currentQty * currentAvgPrice + totalPrice;
    newAvgPrice = Math.floor(totalCost / newQty);
  }

  return { newBalance, newQty, newAvgPrice, totalPrice };
};
