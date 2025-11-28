import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Trade, AccountStats, TradeStatus } from '../types';
import { TrendingUp, TrendingDown, Target, Wallet, Activity, Pencil, Check, X } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  initialBalance: number;
  onUpdateBalance: (amount: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, initialBalance, onUpdateBalance }) => {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(initialBalance.toString());

  const stats: AccountStats = useMemo(() => {
    let currentBalance = initialBalance;
    let wins = 0;
    let losses = 0;
    let totalRR = 0;
    
    // Create equity curve data, starting with initial balance
    const curve = [{ date: 'Start', balance: initialBalance }];

    // Sort trades by date (oldest first for chart)
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    sortedTrades.forEach((trade, index) => {
      if (trade.status === TradeStatus.OPEN) return;

      const pnl = trade.pnl || 0;
      currentBalance += pnl;

      if (trade.status === TradeStatus.WIN) {
        wins++;
        totalRR += trade.rr;
      } else if (trade.status === TradeStatus.LOSS) {
        losses++;
        // For average RR calculation, we typically only look at winners or planned RR, 
        // but here we just sum realized R of winners for a simple 'Avg Reward' metric if needed.
      }

      curve.push({
        date: new Date(trade.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: currentBalance
      });
    });

    const finishedTrades = wins + losses; // Exclude BE/Open for winrate strict calc
    const winRate = finishedTrades > 0 ? (wins / finishedTrades) * 100 : 0;
    const avgRR = wins > 0 ? totalRR / wins : 0;

    return {
      balance: currentBalance,
      initialBalance,
      totalTrades: trades.length,
      wins,
      losses,
      winRate,
      averageRR: avgRR,
      equityCurve: curve
    };
  }, [trades, initialBalance]);

  const handleSaveBalance = () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val) && val > 0) {
      onUpdateBalance(val);
      setIsEditingBalance(false);
    }
  };

  const handleStartEdit = () => {
    setTempBalance(initialBalance.toString());
    setIsEditingBalance(true);
  };

  // Determine Growth Color
  const isProfitable = stats.balance >= stats.initialBalance;

  return (
    <section id="dashboard" className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Account Overview</h2>
          <p className="text-slate-500 mt-1">Track your consistency and growth.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center relative min-h-[120px]">
            {!isEditingBalance ? (
              <>
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-500">Current Balance</p>
                    <button 
                      onClick={handleStartEdit}
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                      title="Edit Initial Balance"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                  <div className={`p-2 rounded-full ${isProfitable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                  ${stats.balance.toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Initial: ${initialBalance.toLocaleString()}
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200">
                <label className="text-xs font-semibold text-slate-500 uppercase">Set Initial Balance</label>
                <div className="flex gap-2">
                   <input 
                    type="number" 
                    value={tempBalance}
                    onChange={(e) => setTempBalance(e.target.value)}
                    className="w-full px-2 py-1 text-lg font-bold border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={handleSaveBalance}
                    className="flex-1 bg-blue-600 text-white text-xs font-bold py-1.5 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button 
                    onClick={() => setIsEditingBalance(false)}
                    className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-1.5 rounded hover:bg-slate-200 flex items-center justify-center gap-1"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Win Rate Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between min-h-[120px]">
            <div>
              <p className="text-sm font-medium text-slate-500">Win Rate</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.winRate.toFixed(1)}%
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Target className="w-6 h-6" />
            </div>
          </div>

           {/* Total Trades Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between min-h-[120px]">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Trades</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.totalTrades}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>

           {/* Profit Factor / Avg RR Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between min-h-[120px]">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg Winner RR</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.averageRR.toFixed(2)}R
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Equity Growth Curve</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={stats.equityCurve}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
              />
              <ReferenceLine y={initialBalance} stroke="#94a3b8" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;