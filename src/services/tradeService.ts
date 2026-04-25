import { supabase } from "@/lib/supabase";
import type { Stock } from "@/types/stock";

export const updateTradeDB = async (
  userId: string,
  stock: Stock,
  newBalance: number,
  newQty: number,
  newAvgPrice: number,
) => {
  // 잔고 업데이트
  const profilePromise = supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", userId);

  // 보유 종목 업데이트
  const holdingPromise =
    newQty > 0
      ? supabase.from("holdings").upsert(
          {
            user_id: userId,
            symbol: stock.symbol,
            name: stock.name,
            quantity: newQty,
            average_price: newAvgPrice,
          },
          { onConflict: "user_id, symbol" },
        )
      : supabase
          .from("holdings")
          .delete()
          .eq("user_id", userId)
          .eq("symbol", stock.symbol);

  // 병렬 실행 및 결과 반환
  const [pRes, hRes] = await Promise.all([profilePromise, holdingPromise]);

  if (pRes.error) throw pRes.error;
  if (hRes.error) throw hRes.error;
};
