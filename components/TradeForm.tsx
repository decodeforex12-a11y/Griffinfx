import React, { useState, useEffect } from 'react';
import { Plus, Check, Brain, Loader2, Save, X } from 'lucide-react';
import { Direction, CONFLUENCE_LIST, Trade, TradeStatus } from '../types';
import { analyzeTrade } from '../services/geminiService';

interface TradeFormProps {
  onSaveTrade: (trade: Trade) => void;
  tradeToEdit: Trade | null;
  onCancelEdit: () => void;
  accountBalance: number;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSaveTrade, tradeToEdit, onCancelEdit, accountBalance }) => {
  // Form State
  const [pair, setPair] = useState('');
  const [assetClass, setAssetClass] = useState('Forex');
  const [direction, setDirection] = useState<Direction>(Direction.BUY);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [timeframe, setTimeframe] = useState('15m');
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>([]);
  const [session, setSession] = useState('New York');
  const [reason, setReason] = useState('');
  const [riskPercent, setRiskPercent] = useState<string>('1.0');
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State
  const [rr, setRr] = useState<number>(0);
  const [pipsDiff, setPipsDiff] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('');
  const [confluenceScore, setConfluenceScore] = useState(0);

  // Populate form when tradeToEdit changes
  useEffect(() => {
    if (tradeToEdit) {
      setPair(tradeToEdit.pair);
      setAssetClass(tradeToEdit.assetClass || 'Forex');
      setDirection(tradeToEdit.direction);
      setEntryPrice(tradeToEdit.entryPrice.toString());
      setStopLoss(tradeToEdit.stopLoss.toString());
      setTakeProfit(tradeToEdit.takeProfit.toString());
      setTimeframe(tradeToEdit.timeframe);
      setSelectedConfluences(tradeToEdit.confluences);
      setSession(tradeToEdit.session);
      setReason(tradeToEdit.reason);
      setRiskPercent(tradeToEdit.riskPercent?.toString() || '1.0');
      // Clear previous AI analysis to encourage re-check if needed
      setAiAnalysis('');
    } else {
      // Reset form if editing is cancelled or completed
      setPair('');
      setReason('');
      setSelectedConfluences([]);
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setRiskPercent('1.0');
      setAiAnalysis('');
    }
  }, [tradeToEdit]);

  // Calculate RR, Pips, and Lot Size
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const riskP = parseFloat(riskPercent) || 0;
    const riskAmt = (accountBalance * riskP) / 100;

    // Calculate RR
    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && entry !== sl) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      const calculatedRR = reward / risk;
      setRr(parseFloat(calculatedRR.toFixed(2)));
    } else {
      setRr(0);
    }

    // Calculate Pips/Points & Lot Size
    if (!isNaN(entry) && !isNaN(sl) && riskAmt > 0) {
      // 1. Calculate raw price difference
      let diff = 0;
      if (direction === Direction.BUY) {
        diff = entry - sl;
      } else {
        diff = sl - entry;
      }

      // 2. Normalize to "Pips" or "Points" based on Asset Class for display
      let displayPips = 0;

      if (assetClass === 'Forex') {
        const isJpy = pair.toUpperCase().includes('JPY');
        displayPips = isJpy ? diff * 100 : diff * 10000;
      } else if (assetClass === 'Gold') {
        displayPips = diff * 10; // Displaying in "pips" where 0.10 = 1 pip
      } else if (assetClass === 'Indices') {
        displayPips = diff; 
      } else { // Crypto
        displayPips = diff;
      }

      setPipsDiff(displayPips.toFixed(1));

      // 3. Calculate Lot Size
      const dist = Math.abs(entry - sl);
      let calculatedLot = 0;

      if (dist > 0) {
        if (assetClass === 'Forex') {
           // Approx Formula: Risk / (Pips * 10)
           calculatedLot = riskAmt / (Math.abs(displayPips) * 10);
        } else if (assetClass === 'Gold') {
           // Risk / (PriceDiff * 100oz)
           calculatedLot = riskAmt / (dist * 100);
        } else if (assetClass === 'Indices') {
           // Risk / (Points * 1) (Assuming 1 lot = $1/point generic CFD)
           calculatedLot = riskAmt / (dist * 1);
        } else {
           // Crypto: Risk / PriceDiff (1 lot = 1 coin)
           calculatedLot = riskAmt / dist;
        }
        
        setLotSize(calculatedLot.toFixed(2));
      } else {
        setLotSize('');
      }

    } else {
      setPipsDiff('');
      setLotSize('');
    }

  }, [entryPrice, stopLoss, takeProfit, direction, pair, assetClass, riskPercent, accountBalance]);

  // Calculate Score Effect
  useEffect(() => {
    setConfluenceScore(selectedConfluences.length);
  }, [selectedConfluences]);

  const toggleConfluence = (item: string) => {
    if (selectedConfluences.includes(item)) {
      setSelectedConfluences(prev => prev.filter(i => i !== item));
    } else {
      setSelectedConfluences(prev => [...prev, item]);
    }
  };

  const getScoreRating = (score: number) => {
    if (score >= 6) return { text: 'High Probability', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 3) return { text: 'Average Setup', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Weak Setup', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const rating = getScoreRating(confluenceScore);

  const handleAIAnalysis = async () => {
    if (!reason || !pair) {
      alert("Please fill in Pair and Reason for analysis.");
      return;
    }
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    const draftTrade: Partial<Trade> = {
      pair, direction, timeframe, rr, confluences: selectedConfluences, reason
    };

    const result = await analyzeTrade(draftTrade);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entryPrice || !stopLoss) return;

    const riskP = parseFloat(riskPercent) || 0;
    const riskAmt = (accountBalance * riskP) / 100;

    const tradeData: Trade = {
      id: tradeToEdit ? tradeToEdit.id : Date.now().toString(), // Keep ID if editing
      pair: pair.toUpperCase(),
      assetClass,
      direction,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      timeframe,
      rr,
      confluences: selectedConfluences,
      confluenceScore,
      session,
      reason,
      timestamp: tradeToEdit ? tradeToEdit.timestamp : Date.now(), // Keep timestamp if editing
      status: tradeToEdit ? tradeToEdit.status : TradeStatus.OPEN, // Keep status
      pnl: tradeToEdit ? tradeToEdit.pnl : undefined, // Keep realized PnL if any
      riskPercent: riskP,
      riskAmount: riskAmt
    };

    onSaveTrade(tradeData);
    
    // Form reset is handled by useEffect when tradeToEdit becomes null or manually if adding
    if (!tradeToEdit) {
      setPair('');
      setReason('');
      setSelectedConfluences([]);
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setAiAnalysis('');
      setPipsDiff('');
      setLotSize('');
      alert("Trade Saved Successfully!");
    } else {
      alert("Trade Updated Successfully!");
    }
  };

  const riskAmountDisplay = ((accountBalance * (parseFloat(riskPercent) || 0)) / 100).toFixed(2);

  return (
    <section id="add-trade" className={`py-12 border-y ${tradeToEdit ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {tradeToEdit ? 'Edit Trade Entry' : 'Add New Trade'}
            </h2>
            <p className="text-slate-500 mt-1">
              {tradeToEdit ? 'Modifying existing journal entry.' : 'Plan your trade, follow your rules.'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${rating.bg} ${rating.color}`}>
            <span>Score: {confluenceScore}/10</span>
            <span className="text-sm opacity-80">({rating.text})</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Top Row: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Pair</label>
              <input 
                type="text" 
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="EURUSD"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
             <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Class</label>
              <select 
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Forex">Forex</option>
                <option value="Gold">Gold</option>
                <option value="Indices">Indices</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Direction</label>
              <select 
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={Direction.BUY}>Buy (Long)</option>
                <option value={Direction.SELL}>Sell (Short)</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Timeframe</label>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="D">Daily</option>
              </select>
            </div>
            <div className="col-span-1">
               <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
               <select 
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Asia">Asia</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
              </select>
            </div>
          </div>

          {/* Second Row: Prices & Logic */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100 items-start">
            
            {/* Risk % */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk %</label>
              <div className="relative">
                <input 
                  type="number" step="0.1"
                  value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:border-blue-500 outline-none"
                  required
                />
                <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                 <div>Risk: <span className="font-bold text-slate-800">${riskAmountDisplay}</span></div>
                 {lotSize && (
                   <div className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded inline-block">
                     Rec. Lot: {lotSize}
                   </div>
                 )}
              </div>
            </div>

            {/* Entry */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Entry Price</label>
              <input 
                type="number" step="any"
                value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:border-blue-500 outline-none"
                placeholder="1.0500"
                required
              />
            </div>

            {/* SL */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 text-red-500">Stop Loss</label>
              <input 
                type="number" step="any"
                value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-red-200 rounded-md focus:border-red-500 outline-none"
                placeholder="1.0450"
                required
              />
              {pipsDiff && (
                <div className={`mt-1 text-xs font-medium ${parseFloat(pipsDiff) < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {parseFloat(pipsDiff) < 0 ? 'Invalid SL' : `${pipsDiff} pips`}
                </div>
              )}
            </div>

            {/* TP */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 text-green-600">Take Profit</label>
              <input 
                type="number" step="any"
                value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-md focus:border-green-500 outline-none"
                placeholder="1.0600"
                required
              />
               {rr > 0 && (
                <div className="mt-1 text-xs font-bold text-green-600">
                  {rr.toFixed(2)} RR
                </div>
              )}
            </div>
          </div>

          {/* Third Row: Confluences */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Confluences</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONFLUENCE_LIST.map((item) => (
                <div 
                  key={item}
                  onClick={() => toggleConfluence(item)}
                  className={`cursor-pointer px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${
                    selectedConfluences.includes(item)
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {item}
                  {selectedConfluences.includes(item) && <Check size={16} />}
                </div>
              ))}
            </div>
          </div>

          {/* Fourth Row: Reason & Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Trade Logic / Notes</label>
               <textarea 
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you taking this trade? What is the market structure telling you?"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               />
               <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1.5"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
                  Analyze with AI Mentor
                </button>
            </div>

            {/* AI Output Area */}
            <div className={`rounded-xl p-5 border ${aiAnalysis ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100 dashed'}`}>
              {aiAnalysis ? (
                 <div>
                   <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold">
                     <Brain className="w-5 h-5" /> AI Feedback
                   </div>
                   <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
                 </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm text-center">
                  <Brain className="w-8 h-8 mb-2 opacity-50" />
                  <p>Get instant feedback on your setup<br/>before executing.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3">
             {tradeToEdit && (
               <button
                 type="button"
                 onClick={onCancelEdit}
                 className="bg-slate-100 text-slate-600 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
               >
                 <X className="w-5 h-5" /> Cancel
               </button>
             )}
             <button
               type="submit"
               className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
             >
               {tradeToEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
               {tradeToEdit ? 'Update Trade' : 'Save Trade Journal'}
             </button>
          </div>

        </form>
      </div>
    </section>
  );
};

export default TradeForm;