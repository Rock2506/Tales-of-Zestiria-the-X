import React, { useState } from 'react';
import { Bill } from '../types/bill';
import { calculateBillTotals, formatCurrency } from '../utils/calculations';
import { Users, DollarSign, Percent, Copy, Check, Split } from 'lucide-react';

interface BillSplitterProps {
  bills: Bill[];
  activeBill?: Bill;
}

export const BillSplitter: React.FC<BillSplitterProps> = ({ bills, activeBill }) => {
  const [selectedBillId, setSelectedBillId] = useState<string>(activeBill?.id || bills[0]?.id || 'custom');
  const [customAmount, setCustomAmount] = useState<number>(4500);
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState('Rs.');
  const [numPeople, setNumPeople] = useState<number>(4);
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Determine base amount
  const selectedBill = bills.find((b) => b.id === selectedBillId);
  const baseAmount = selectedBill ? calculateBillTotals(selectedBill).grandTotal : customAmount;
  const sym = selectedBill ? selectedBill.currencySymbol : customCurrencySymbol;

  const tipAmount = baseAmount * (tipPercent / 100);
  const totalWithTip = baseAmount + tipAmount;

  let perPersonBase = numPeople > 0 ? totalWithTip / numPeople : 0;
  if (roundUp) {
    perPersonBase = Math.ceil(perPersonBase);
  }

  const roundedGrandTotal = perPersonBase * numPeople;

  const handleCopySplit = () => {
    const text = `Bill Split Breakdown:
Bill Total: ${formatCurrency(baseAmount, sym)}
Tip (${tipPercent}%): ${formatCurrency(tipAmount, sym)}
Total with Tip: ${formatCurrency(totalWithTip, sym)}
Number of People: ${numPeople}
👉 Each Person Pays: ${formatCurrency(perPersonBase, sym)}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center justify-center gap-2">
          <Split className="w-5 h-5 text-neutral-600" />
          <span>Bill & Payment Splitter</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Divide bill payments evenly with tip calculation and instant share copy.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-2xs space-y-6">
        {/* Source selection */}
        <div>
          <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
            Select Bill or Enter Custom Amount
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedBillId}
              onChange={(e) => setSelectedBillId(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none"
            >
              <option value="custom">Custom Manual Amount</option>
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.billNumber} — {b.client.name || 'Client'} ({formatCurrency(calculateBillTotals(b).grandTotal, b.currencySymbol)})
                </option>
              ))}
            </select>

            {selectedBillId === 'custom' && (
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customAmount === 0 ? '' : customAmount}
                  onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-semibold bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white"
                />
                <DollarSign className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        </div>

        {/* Number of People */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-neutral-500" />
              <span>Split Between ({numPeople} people)</span>
            </label>
            <span className="text-xs font-mono text-neutral-500">{numPeople} Person(s)</span>
          </div>

          <div className="flex items-center gap-2">
            {[2, 3, 4, 5, 6, 8, 10].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setNumPeople(count)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  numPeople === count
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="24"
              value={numPeople}
              onChange={(e) => setNumPeople(parseInt(e.target.value) || 1)}
              className="flex-1 accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg"
            />
            <span className="text-xs font-mono w-8 text-right font-medium">{numPeople}</span>
          </div>
        </div>

        {/* Tip / Gratuity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-neutral-500" />
              <span>Add Tip / Service Percentage</span>
            </label>
            <span className="text-xs font-mono text-neutral-500">
              +{formatCurrency(tipAmount, sym)} ({tipPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[0, 10, 15, 18, 20, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTipPercent(pct)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  tipPercent === pct
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Round Up Option */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-100 text-xs">
          <label className="text-neutral-700 font-medium cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={roundUp}
              onChange={(e) => setRoundUp(e.target.checked)}
              className="accent-neutral-900 rounded"
            />
            <span>Round up each person's share to nearest whole number</span>
          </label>
        </div>

        {/* Results Card */}
        <div className="p-6 bg-neutral-900 text-white rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <span className="text-xs text-neutral-400 block">Total Due per Person</span>
              <span className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatCurrency(perPersonBase, sym)}
              </span>
            </div>
            <button
              onClick={handleCopySplit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Split</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div>
              <span className="text-neutral-400 block text-[11px]">Base Total</span>
              <span className="font-mono text-sm tabular-nums text-neutral-200">
                {formatCurrency(baseAmount, sym)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Tip ({tipPercent}%)</span>
              <span className="font-mono text-sm tabular-nums text-neutral-200">
                {formatCurrency(tipAmount, sym)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Grand Total</span>
              <span className="font-mono text-sm tabular-nums text-neutral-200 font-bold">
                {formatCurrency(roundUp ? roundedGrandTotal : totalWithTip, sym)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
