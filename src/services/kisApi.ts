import { supabase } from "@/lib/supabase";

export const getStockPrice = async (symbol: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol }
    });

    if (error) throw error;
    
    return {
      stck_prpr: data.stck_prpr,
      prdy_ctrt: data.prdy_ctrt
    };
  } catch (error) {
    console.error("Edge Function Error:", error);
    return null;
  }
};