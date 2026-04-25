interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  average_price: number;
}

interface DisplayHolding extends Holding {
  currentPrice: number;
  profitRate: number;
}

export type { Stock, Holding, DisplayHolding };
