export enum Direction {
  BUY = 'Buy',
  SELL = 'Sell'
}

export enum TradeStatus {
  OPEN = 'Open',
  WIN = 'Win',
  LOSS = 'Loss',
  BREAK_EVEN = 'Break Even'
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Trade {
  id: string;
  pair: string;
  assetClass?: string;
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  rr: number;
  confluences: string[];
  confluenceScore: number;
  session: string;
  reason: string;
  timestamp: number;
  status: TradeStatus;
  pnl?: number; // Realized PnL
  riskPercent?: number;
  riskAmount?: number;
}

export interface AccountStats {
  balance: number;
  initialBalance: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  averageRR: number;
  equityCurve: { date: string; balance: number }[];
}

export const CONFLUENCE_LIST = [
  "Structure Break (BOS/CHoch)",
  "Supply & Demand Zone",
  "Imbalance (FVG)",
  "Liquidity Sweep",
  "Mitigation / Retest",
  "200 EMA Trend",
  "ATR Volatility Filter",
  "Fibonacci Golden Zone",
  "RSI Divergence",
  "Fundamental Bias"
];