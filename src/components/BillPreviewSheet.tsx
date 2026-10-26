import React from 'react';
import { Bill, CalculatedBillTotals } from '../types/bill';
import { calculateBillTotals, formatCurrency } from '../utils/calculations';

interface BillPreviewSheetProps {
  bill: Bill;
  totals?: CalculatedBillTotals;
  scale?: 'normal' | 'compact';
  id?: string;
}

export const BillPreviewSheet: React.FC<BillPreviewSheetProps> = ({
  bill,
  totals: providedTotals,
  scale = 'normal',
  id = 'bill-preview-sheet',
}) => {
  const totals = providedTotals || calculateBillTotals(bill);
  const sym = bill.currencySymbol || 'Rs.';

  return (
    <div
      id={id}
      className={`print-sheet bg-white rounded-xl border border-neutral-300 shadow-sm text-neutral-900 mx-auto transition-all ${
        scale === 'compact' ? 'p-5 max-w-md' : 'p-8 max-w-lg'
      }`}
    >
      {/* Shop Header */}
      <div className="text-center pb-4 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
          {bill.business.name || 'My Shop'}
        </h1>
        {bill.business.phone && (
          <p className="text-xs text-neutral-600 mt-1">
            Phone: {bill.business.phone}
          </p>
        )}
        {bill.business.address && (
          <p className="text-xs text-neutral-500">
            {bill.business.address}
          </p>
        )}
      </div>

      {/* Bill & Customer Info */}
      <div className="py-3 border-b border-neutral-200 text-xs flex justify-between items-center">
        <div>
          <span className="text-neutral-500 block">Customer Name:</span>
          <span className="font-bold text-neutral-900 text-sm">
            {bill.client.name || 'Walk-in Customer'}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold text-neutral-800">
            {bill.billNumber}
          </div>
          <div className="text-neutral-500 text-[11px] font-mono">
            {bill.issueDate}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="pb-2">Item</th>
              <th className="pb-2 text-center w-12">Qty</th>
              <th className="pb-2 text-right w-20">Price</th>
              <th className="pb-2 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {bill.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-neutral-400 italic">
                  No items added yet
                </td>
              </tr>
            ) : (
              bill.items.map((item, idx) => {
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                return (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 pr-2 font-medium text-neutral-900">
                      {item.description || 'Item'}
                    </td>
                    <td className="py-2.5 text-center text-neutral-700 font-mono tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right text-neutral-600 font-mono tabular-nums">
                      {formatCurrency(item.unitPrice, sym)}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-neutral-900 font-mono tabular-nums">
                      {formatCurrency(lineTotal, sym)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Final Payment Total - Ends cleanly after items and prices */}
      <div className="pt-3 border-t-2 border-neutral-900 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Total Amount:
          </span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totals.grandTotal, sym)}
          </span>
        </div>

        {/* Cash Tendered & Change (only if entered) */}
        {bill.cashTendered !== undefined && bill.cashTendered > 0 && (
          <div className="pt-2 border-t border-neutral-200 text-xs space-y-1">
            <div className="flex justify-between text-neutral-600">
              <span>Cash Received:</span>
              <span className="font-mono tabular-nums font-medium">
                {formatCurrency(bill.cashTendered, sym)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Change Returned:</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(totals.changeDue, sym)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-[11px] text-neutral-400 border-t border-dashed border-neutral-200 mt-6">
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  );
};
