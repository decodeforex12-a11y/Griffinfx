import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeForm from './components/TradeForm';
import RiskCalculator from './components/RiskCalculator';
import TradeList from './components/TradeList';
import Login from './components/Login';
import { Trade, User } from './types';
import { 
  getTrades, 
  saveTrade, 
  editTrade, 
  getInitialBalance, 
  setInitialBalance, 
  setCurrentUserId 
} from './services/storageService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [initialBalance, setInitialBalanceState] = useState(10000);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth Check
  useEffect(() => {
    const savedUser = sessionStorage.getItem('tradeflow_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCurrentUserId(parsedUser.id);
      loadUserData();
    }
    setIsLoading(false);
  }, []);

  const loadUserData = () => {
    setTrades(getTrades());
    setInitialBalanceState(getInitialBalance());
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    sessionStorage.setItem('tradeflow_user', JSON.stringify(newUser));
    setCurrentUserId(newUser.id);
    loadUserData();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tradeflow_user');
    setUser(null);
    setTrades([]);
    setCurrentUserId('guest');
  };

  const handleSaveTrade = (trade: Trade) => {
    if (tradeToEdit) {
      // Editing existing trade
      const updated = editTrade(trade);
      setTrades(updated);
      setTradeToEdit(null); // Clear edit mode
    } else {
      // Creating new trade
      const updated = saveTrade(trade);
      setTrades(updated);
    }
    // Scroll to dashboard to see update
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    document.getElementById('add-trade')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTradeToEdit(null);
  };

  const handleUpdateTrades = () => {
    setTrades(getTrades());
  };

  const handleUpdateBalance = (newBalance: number) => {
    setInitialBalance(newBalance);
    setInitialBalanceState(newBalance);
  };

  // Calculate current balance for the risk calculator prop
  // Simple logic: Initial + Sum of all realized PnL
  const currentBalance = trades.reduce((acc, trade) => {
    return acc + (trade.pnl || 0);
  }, initialBalance);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-20"> {/* Padding for fixed header */}
        
        <Dashboard 
          trades={trades} 
          initialBalance={initialBalance} 
          onUpdateBalance={handleUpdateBalance}
        />
        
        <TradeForm 
          onSaveTrade={handleSaveTrade} 
          tradeToEdit={tradeToEdit}
          onCancelEdit={handleCancelEdit}
          accountBalance={currentBalance}
        />
        
        <TradeList 
          trades={trades} 
          onUpdate={handleUpdateTrades} 
          onEdit={handleEditTrade}
        />
        
        <RiskCalculator balance={currentBalance} />

      </main>
      
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} TradeFlow System. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-50">Trading involves risk. This tool is for educational and journaling purposes only.</p>
      </footer>
    </div>
  );
}

export default App;
