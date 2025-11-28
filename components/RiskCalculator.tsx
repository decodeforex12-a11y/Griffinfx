import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

const RiskCalculator: React.FC<{ balance: number }> = ({ balance }) => {
  const [calcBalance, setCalcBalance] = useState<number>(balance);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [stopLossPips, setStopLossPips] = useState<number>(10);
  const [assetClass, setAssetClass] = useState('Forex');

  // Update local state when prop changes (e.g. user updates initial balance in dashboard)
  useEffect(() => {
    setCalcBalance(balance);
  }, [balance]);

  // Approximate Pip Values for Standard Lot (1.00)
  // Forex: ~$10 per pip
  // Indices (US30): ~$1 per point (varies heavily by broker, simplified here)
  // Gold (XAUUSD): ~$10 per pip (10 cents move)
  const getPipValue = (asset: string) => {
    switch (asset) {
      case 'Forex': return 10;
      case 'Indices': return 1; 
      case 'Gold': return 10; 
      default: return 10;
    }
  };

  const riskAmount = calcBalance * (riskPercent / 100);
  const pipValueStd = getPipValue(assetClass);
  // Formula: Lot = RiskAmount / (SL * PipValuePerLot)
  const recommendedLot = stopLossPips > 0 ? riskAmount / (stopLossPips * pipValueStd) : 0;

  return (
    <section id="risk-calculator" className="py-16 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-xl">
             <Calculator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Risk Calculator</h2>
            <p className="text-slate-400">Position sizing tool to protect your capital.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Inputs */}
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
               <div>
                 <label className="block text-slate-400 text-sm mb-2">Account Balance ($)</label>
                 <input 
                  type="number" 
                  value={calcBalance}
                  onChange={(e) => setCalcBalance(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 outline-none text-white"
                 />
               </div>
               <div>
                 <label className="block text-slate-400 text-sm mb-2">Risk Percentage (%)</label>
                 <input 
                  type="number" step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 outline-none text-white"
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Stop Loss (Pips/Points)</label>
                  <input 
                    type="number" 
                    value={stopLossPips}
                    onChange={(e) => setStopLossPips(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 outline-none text-white"
                  />
                </div>
                 <div>
                  <label className="block text-slate-400 text-sm mb-2">Asset Class</label>
                  <select 
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 outline-none text-white appearance-none"
                  >
                    <option value="Forex">Forex (Majors)</option>
                    <option value="Gold">Gold (XAUUSD)</option>
                    <option value="Indices">Indices (US30/NAS100)</option>
                  </select>
                </div>
             </div>
          </div>

          {/* Results Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl flex flex-col justify-center relative overflow-hidden">
             {/* Decorative circle */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

             <div className="relative z-10">
               <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/20">
                 <span className="text-blue-100 font-medium">Total Risk Amount</span>
                 <span className="text-3xl font-bold text-white">${riskAmount.toFixed(2)}</span>
               </div>

               <div className="mb-2">
                 <span className="text-blue-200 text-sm uppercase tracking-wider font-semibold">Recommended Lot Size</span>
                 <div className="flex items-baseline gap-2 mt-1">
                   <span className="text-6xl font-bold text-white">{recommendedLot.toFixed(2)}</span>
                   <span className="text-blue-200">Lots</span>
                 </div>
               </div>

               <p className="text-blue-200 text-sm mt-4">
                 Based on {stopLossPips} pips SL. This ensures you do not lose more than {riskPercent}% of your equity.
               </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RiskCalculator;