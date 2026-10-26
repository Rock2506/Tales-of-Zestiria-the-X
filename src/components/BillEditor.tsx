import React, { useState } from 'react';
import { Bill, BillItem } from '../types/bill';
import {
  calculateBillTotals,
  formatCurrency,
  saveUserDefaultShopProfile,
} from '../utils/calculations';
import { downloadBillAsPDF, downloadBillAsImage } from '../utils/downloadBill';
import { BillPreviewSheet } from './BillPreviewSheet';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  ArrowLeft,
  Building2,
  User,
  Check,
  Share2,
  Download,
  Image as ImageIcon,
  BookmarkCheck,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface BillEditorProps {
  bill: Bill;
  onChange: (updatedBill: Bill) => void;
  onSave: () => void;
  onBackToDashboard: () => void;
  onPrint: () => void;
}

export const BillEditor: React.FC<BillEditorProps> = ({
  bill,
  onChange,
  onSave,
  onBackToDashboard,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'png' | null>(null);
  const [savedDefaultNotification, setSavedDefaultNotification] = useState(false);

  const totals = calculateBillTotals(bill);
  const sym = bill.currencySymbol || 'Rs.';

  // Updates
  const updateBillField = <K extends keyof Bill>(field: K, value: Bill[K]) => {
    onChange({
      ...bill,
      [field]: value,
    });
  };

  const updateBusinessField = (field: keyof Bill['business'], value: string) => {
    onChange({
      ...bill,
      business: {
        ...bill.business,
        [field]: value,
      },
    });
  };

  const updateClientName = (name: string) => {
    onChange({
      ...bill,
      client: {
        ...bill.client,
        name,
      },
    });
  };

  const handleSaveAsDefaultShop = () => {
    saveUserDefaultShopProfile(bill.business);
    setSavedDefaultNotification(true);
    setTimeout(() => setSavedDefaultNotification(false), 2500);
  };

  // Item Management (Simple: Description, Qty, Unit Price)
  const handleAddItem = () => {
    const newItem: BillItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
    };
    onChange({
      ...bill,
      items: [...bill.items, newItem],
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<BillItem>) => {
    onChange({
      ...bill,
      items: bill.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    });
  };

  const handleDeleteItem = (id: string) => {
    if (bill.items.length <= 1) {
      onChange({
        ...bill,
        items: [
          {
            id: `item_${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            discountPercent: 0,
          },
        ],
      });
      return;
    }
    onChange({
      ...bill,
      items: bill.items.filter((it) => it.id !== id),
    });
  };

  // Download handlers
  const handleDownloadPDF = async () => {
    const el = document.getElementById('simple-bill-sheet');
    if (!el) {
      onPrint();
      return;
    }
    try {
      setIsDownloading('pdf');
      const filename = `${bill.business.name || 'Shop'}_Bill_${bill.billNumber}`;
      await downloadBillAsPDF(el, filename);
    } catch (err) {
      console.error(err);
      onPrint();
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadImage = async () => {
    const el = document.getElementById('simple-bill-sheet');
    if (!el) return;
    try {
      setIsDownloading('png');
      const filename = `${bill.business.name || 'Shop'}_Bill_${bill.billNumber}`;
      await downloadBillAsImage(el, filename);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCopySummaryText = () => {
    const summary = `${bill.business.name || 'Shop'} - BILL ${bill.billNumber}
Customer: ${bill.client.name || 'Walk-in Customer'}
Date: ${bill.issueDate}

ITEMS:
${bill.items.map((it) => `• ${it.description || 'Item'}: ${it.quantity} x ${formatCurrency(it.unitPrice, sym)} = ${formatCurrency((it.quantity || 0) * (it.unitPrice || 0), sym)}`).join('\n')}

TOTAL AMOUNT: ${formatCurrency(totals.grandTotal, sym)}
`;
    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="no-print bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Bills</span>
          </button>
          <div className="h-4 w-px bg-neutral-200" />
          <span className="text-sm font-bold text-neutral-900 font-mono">
            {bill.billNumber}
          </span>
          <span className="text-xs text-neutral-400">·</span>
          <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
            Total: {formatCurrency(totals.grandTotal, sym)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden items-center p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'editor' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600'
              }`}
            >
              Receipt
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs disabled:opacity-60"
          >
            {isDownloading === 'pdf' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isDownloading !== null}
            title="Download image for WhatsApp"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">WhatsApp Image</span>
          </button>

          <button
            onClick={handleCopySummaryText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Simple Form on Left, Clean Receipt on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Clean Simple Form */}
        <div className={`lg:col-span-7 space-y-5 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* 1. SIMPLE SHOP & BILL HEADER */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-neutral-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Shop Name & Bill Details
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSaveAsDefaultShop}
                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                title="Save this shop name as default for future bills"
              >
                <BookmarkCheck className="w-3 h-3 text-neutral-500" />
                <span>{savedDefaultNotification ? 'Saved as Default!' : 'Save Shop as Default'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-800 block mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Memon Electronics, Super General Store"
                  value={bill.business.name}
                  onChange={(e) => updateBusinessField('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Shop Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={bill.business.phone}
                  onChange={(e) => updateBusinessField('phone', e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Bill Date
                </label>
                <input
                  type="date"
                  value={bill.issueDate}
                  onChange={(e) => updateBillField('issueDate', e.target.value)}
                  className="w-full px-3 py-1.5 font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. ONLY CUSTOMER NAME */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <User className="w-4 h-4 text-neutral-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Customer Name
              </h2>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter Customer Name (e.g. Tariq Mehmood, Walk-in Customer)"
                value={bill.client.name}
                onChange={(e) => updateClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          {/* 3. ITEMS & PRICES INSERTION (End on items and prices after what comes cut it) */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Items & Prices
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Insert item name, quantity, and unit price. Total calculates automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Simple Items List */}
            <div className="space-y-3">
              {bill.items.map((item, index) => {
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
                  >
                    <span className="font-mono text-neutral-400 font-semibold w-5 shrink-0 hidden sm:block text-right">
                      {index + 1}.
                    </span>

                    {/* Item Name */}
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase sm:hidden block mb-0.5">
                        Item Description
                      </label>
                      <input
                        type="text"
                        placeholder="Item Name (e.g. Mobile Screen, AC Service, Charger)"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        className="w-full px-3 py-1.5 font-medium bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Qty */}
                    <div className="w-full sm:w-20">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase sm:hidden block mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="Qty"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 font-mono text-center bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase sm:hidden block mb-0.5">
                        Price (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Price"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 font-mono text-right bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="w-full sm:w-28 text-right font-mono font-bold text-neutral-900 tabular-nums self-center">
                      <span className="sm:hidden text-[10px] text-neutral-400 font-normal mr-2">Total:</span>
                      {formatCurrency(lineTotal, sym)}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors self-end sm:self-center"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add another item</span>
            </button>
          </div>

          {/* 4. FINAL PAYMENT / TOTAL (Ends cleanly after items and prices - no tax, no tips, no discount clutter) */}
          <div className="bg-neutral-900 text-white p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-baseline border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 block font-semibold">
                  Final Payment / Total:
                </span>
                <span className="text-[11px] text-neutral-500">
                  Calculated from items and prices
                </span>
              </div>
              <span className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatCurrency(totals.grandTotal, sym)}
              </span>
            </div>

            {/* Optional Cash Tendered & Change return helper */}
            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-300 font-medium block">
                  Cash Received from Customer (Optional)
                </span>
                <span className="text-[10px] text-neutral-500">
                  Calculates change to return
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Cash Received (Rs.)"
                  value={bill.cashTendered === 0 ? '' : bill.cashTendered}
                  onChange={(e) => updateBillField('cashTendered', parseFloat(e.target.value) || 0)}
                  className="w-36 px-3 py-1.5 bg-neutral-800 text-white border border-neutral-700 rounded-lg font-mono text-right text-xs focus:outline-none focus:ring-1 focus:ring-white"
                />

                {bill.cashTendered !== undefined && bill.cashTendered > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Change</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                      {formatCurrency(totals.changeDue, sym)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Live Printable Receipt */}
        <div className={`lg:col-span-5 ${activeTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <span className="font-semibold uppercase tracking-wider text-neutral-400">
                Live Receipt Preview
              </span>
              <span className="text-neutral-400">
                Updates as you type
              </span>
            </div>

            {/* The Clean Receipt */}
            <BillPreviewSheet
              id="simple-bill-sheet"
              bill={bill}
              totals={totals}
              scale="compact"
            />

            {/* Prominent Download CTAs under Preview */}
            <div className="no-print pt-2 space-y-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading !== null}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDownloading === 'pdf' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF Bill...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Bill</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isDownloading !== null}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>WhatsApp Image</span>
                </button>

                <button
                  type="button"
                  onClick={onPrint}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-neutral-600" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
