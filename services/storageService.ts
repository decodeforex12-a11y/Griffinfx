import { Trade } from '../types';

let currentUserId = 'guest';

export const setCurrentUserId = (id: string) => {
  currentUserId = id;
};

const getKeys = () => ({
  trades: `tradeflow_trades_${currentUserId}`,
  balance: `tradeflow_balance_${currentUserId}`
});

export const getTrades = (): Trade[] => {
  const { trades } = getKeys();
  const data = localStorage.getItem(trades);
  return data ? JSON.parse(data) : [];
};

export const saveTrade = (trade: Trade): Trade[] => {
  const currentTrades = getTrades();
  const updatedTrades = [trade, ...currentTrades];
  localStorage.setItem(getKeys().trades, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const editTrade = (updatedTrade: Trade): Trade[] => {
  const trades = getTrades();
  const newTrades = trades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
  localStorage.setItem(getKeys().trades, JSON.stringify(newTrades));
  return newTrades;
};

export const updateTradeStatus = (id: string, status: Trade['status'], pnl: number): Trade[] => {
  const trades = getTrades();
  const updatedTrades = trades.map(t => 
    t.id === id ? { ...t, status, pnl } : t
  );
  localStorage.setItem(getKeys().trades, JSON.stringify(updatedTrades));
  return updatedTrades;
};

export const getInitialBalance = (): number => {
  const { balance } = getKeys();
  const bal = localStorage.getItem(balance);
  return bal ? parseFloat(bal) : 10000; // Default 10k
};

export const setInitialBalance = (amount: number) => {
  localStorage.setItem(getKeys().balance, amount.toString());
};

export const clearAllData = () => {
  const { trades, balance } = getKeys();
  localStorage.removeItem(trades);
  localStorage.removeItem(balance);
};
