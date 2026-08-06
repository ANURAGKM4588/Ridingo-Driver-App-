import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  ChevronLeft,
  X,
  RefreshCw,
  Clock
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { RegionCode, formatPrice } from '../data/currencies';

interface WalletViewProps {
  onBack?: () => void;
  currentRegion?: RegionCode;
}

export const WalletView: React.FC<WalletViewProps> = ({ onBack, currentRegion = 'us' }) => {
  const [balance, setBalance] = useState<number>(340.50);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [autoPayEnabled, setAutoPayEnabled] = useState<boolean>(true);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBalance(prev => Math.round((prev + topUpAmount) * 100) / 100);
    setShowTopUpModal(false);
    alert(`Successfully added ${formatPrice(topUpAmount, currentRegion, 2)} to your RIDINGO Wallet!`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] animate-fade-in overflow-hidden">

      {/* ─── FIXED ZONE 1: Page Header ─── */}
      <div className="bg-white border-b border-slate-200 shadow-xs flex-shrink-0 z-30 animate-drop-up stagger-1 pt-[max(env(safe-area-inset-top,54px),54px)]">
        {onBack ? (
          <div className="py-3.5 px-4 flex items-center justify-between">
            <div className="w-10 flex items-center justify-start">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight text-center flex-1 truncate px-2">
              Payment &amp; Wallet Settings
            </h2>
            <div className="w-10" />
          </div>
        ) : (
          <div className="py-3.5 px-4 flex flex-col items-start justify-center text-left">
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Wallet &amp; Payments</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">RIDINGO Reserve Pass balance &amp; transactions</p>
          </div>
        )}
      </div>

      {/* ─── FIXED ZONE 2: Wallet Reserve Card ─── */}
      <div className="bg-white border-b border-slate-200 px-4 pb-4 pt-3 flex-shrink-0 z-20 animate-drop-up stagger-2">
        <div className="rounded-[28px] p-5 text-white bg-gradient-to-br from-[#121212] via-zinc-900 to-black shadow-xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#fcd502]/20 rounded-full blur-3xl group-hover:bg-[#fcd502]/30 transition-all duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            {/* Card Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#fcd502] text-[#121212] flex items-center justify-center font-black text-xs">
                  R
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">RIDINGO Reserve Pass</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#fcd502] text-[10px] font-mono font-bold border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#fcd502]" /> VIP PASS
              </span>
            </div>

            {/* Balance */}
            <div className="text-center">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance</span>
              <h2 className="text-3xl font-black tracking-tight text-white mt-0.5">
                {formatPrice(balance, currentRegion, 2)}
              </h2>
            </div>

            {/* Action Buttons – centered */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowTopUpModal(true)}
                className="flex-1 py-3 rounded-2xl bg-[#fcd502] hover:bg-[#fde047] text-[#121212] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Top Up
              </button>

              <button
                type="button"
                onClick={() => setAutoPayEnabled(!autoPayEnabled)}
                className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  autoPayEnabled
                    ? 'bg-white/15 text-white border-white/20'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoPayEnabled ? 'text-[#fcd502]' : 'text-slate-400'}`} />
                <span>Auto-Pay: {autoPayEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FIXED ZONE 3: "Recent Transactions" label strip ─── */}
      <div className="bg-[#FAFAFA] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-10 animate-drop-up stagger-3">
        <h3 className="text-sm font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" /> Recent Transactions
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {MOCK_TRANSACTIONS.length} records
        </span>
      </div>

      {/* ─── SCROLL ZONE: Only the transaction list scrolls ─── */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-36 bg-[#FAFAFA]">
        <div className="p-4 space-y-2">
          {MOCK_TRANSACTIONS.map((tx, idx) => (
            <div
              key={tx.id}
              className={`bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-sm flex items-center justify-between animate-drop-up stagger-${Math.min(idx + 3, 6)}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    : <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  }
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-xs text-slate-900 truncate leading-snug">{tx.title}</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tx.date}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{tx.method}</p>
                </div>
              </div>

              <span className={`font-black text-sm ml-3 flex-shrink-0 tabular-nums ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                {tx.type === 'credit' ? '+' : '−'}{formatPrice(tx.amount, currentRegion, 2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Top Up Modal ─── */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-[32px] p-5 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Reload Wallet Balance</h3>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-3 rounded-xl font-black text-xs transition-all border flex items-center justify-center ${
                        topUpAmount === amt
                          ? 'bg-slate-900 text-[#fcd502] border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formatPrice(amt, currentRegion)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 font-black text-sm text-slate-900 focus:outline-none focus:border-[#fcd502] text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#fcd502] hover:bg-lime-400 text-[#121212] font-black text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98] cursor-pointer text-center"
              >
                Confirm Reload · {formatPrice(topUpAmount, currentRegion, 2)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
