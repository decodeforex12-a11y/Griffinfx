import React from 'react';
import { Trade, TradeStatus, Direction } from '../types';
import { updateTradeStatus } from '../services/storageService';
import { Pencil } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onUpdate: () => void;
  onEdit: (trade: Trade) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onUpdate, onEdit }) => {
  
  const handleStatusChange = (trade: Trade, status: TradeStatus) => {
    let pnl = 0;
    // Use the saved risk amount if available, otherwise fallback to 100 for legacy trades
    const riskAmount = trade.riskAmount || 100;
    
    if (status === TradeStatus.WIN) {
      pnl = riskAmount * trade.rr;
    } else if (status === TradeStatus.LOSS) {
      pnl = -riskAmount;
    } else {
      pnl = 0;
    }

    updateTradeStatus(trade.id, status, pnl);
    onUpdate();
  };

  const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Journal Entries</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg shadow-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Pair</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Dir</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Risk</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">RR</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Score</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTrades.length === 0 ? (
               <tr><td colSpan={8} className="py-8 text-center text-slate-400">No trades recorded yet.</td></tr>
            ) : (
              sortedTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{trade.pair}</td>
                  <td className={`py-3 px-4 text-sm font-medium ${trade.direction === Direction.BUY ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.direction}
                  </td>
                   <td className="py-3 px-4 text-sm text-slate-600">
                    {trade.riskPercent ? `${trade.riskPercent}%` : '-'}
                    <span className="text-xs text-slate-400 ml-1">(${trade.riskAmount?.toFixed(0) || '?'})</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">1:{trade.rr}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.confluenceScore >= 6 ? 'bg-green-100 text-green-700' : 
                      trade.confluenceScore >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.confluenceScore}/10
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                     <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === TradeStatus.WIN ? 'bg-green-500 text-white' : 
                      trade.status === TradeStatus.LOSS ? 'bg-red-500 text-white' : 
                      trade.status === TradeStatus.OPEN ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onEdit(trade)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Trade Details"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      {trade.status === TradeStatus.OPEN && (
                        <div className="flex gap-2 border-l pl-3 border-slate-200">
                          <button onClick={() => handleStatusChange(trade, TradeStatus.WIN)} className="text-green-600 hover:underline text-xs font-medium">W</button>
                          <button onClick={() => handleStatusChange(trade, TradeStatus.LOSS)} className="text-red-600 hover:underline text-xs font-medium">L</button>
                          <button onClick={() => handleStatusChange(trade, TradeStatus.BREAK_EVEN)} className="text-slate-500 hover:underline text-xs font-medium">BE</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TradeList;