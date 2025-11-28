import { Trade, AccountStats } from '../types';

const TRADES_KEY = 'tradeflow_trades';
const BALANCE_KEY = 'tradeflow_balance';

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(TRADES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTrade = (trade: Trade): Trade[] => {
  const currentTrades = getTrades();
  const updatedTrades = [trade, ...currentTrades];
  localStorage.setItem(TRADES_KEY, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const editTrade = (updatedTrade: Trade): Trade[] => {
  const trades = getTrades();
  const newTrades = trades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
  localStorage.setItem(TRADES_KEY, JSON.stringify(newTrades));
  return newTrades;
};

export const updateTradeStatus = (id: string, status: Trade['status'], pnl: number): Trade[] => {
  const trades = getTrades();
  const updatedTrades = trades.map(t => 
    t.id === id ? { ...t, status, pnl } : t
  );
  localStorage.setItem(TRADES_KEY, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const getInitialBalance = (): number => {
  const bal = localStorage.getItem(BALANCE_KEY);
  return bal ? parseFloat(bal) : 10000; // Default 10k
};

export const setInitialBalance = (amount: number) => {
  localStorage.setItem(BALANCE_KEY, amount.toString());
};

export const clearAllData = () => {
  localStorage.removeItem(TRADES_KEY);
  localStorage.removeItem(BALANCE_KEY);
};