import React, { useState, useMemo } from 'react';
import { Bill, BillStatus } from '../types/bill';
import { calculateBillTotals, formatCurrency, exportBillsToCSV } from '../utils/calculations';
import {
  Search,
  Plus,
  ArrowUpDown,
  Download,
  Filter,
  Eye,
  Trash2,
  Copy,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Receipt,
  DollarSign,
  FileDown
} from 'lucide-react';
import { MonthlyRevenueChart } from './MonthlyRevenueChart';

interface DashboardProps {
  bills: Bill[];
  onSelectBill: (billId: string) => void;
  onNewBill: () => void;
  onDuplicateBill: (bill: Bill) => void;
  onDeleteBill: (billId: string) => void;
  onResetDemoData: () => void;
  onPrintBill: (bill: Bill) => void;
}

type SortField = 'date' | 'dueDate' | 'amount' | 'customer' | 'billId';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({
  bills,
  onSelectBill,
  onNewBill,
  onDuplicateBill,
  onDeleteBill,
  onResetDemoData,
  onPrintBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Overall metric calculations across all bills
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    bills.forEach((b) => {
      const totals = calculateBillTotals(b);
      totalRevenue += totals.grandTotal;
      totalCollected += totals.amountPaid;
      totalOutstanding += totals.balanceDue;

      if (b.status === 'paid') paidCount++;
      else if (b.status === 'overdue') overdueCount++;
      else pendingCount++;
    });

    return {
      totalRevenue,
      totalCollected,
      totalOutstanding,
      totalCount: bills.length,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [bills]);

  // Unique currencies present in bills
  const availableCurrencies = useMemo(() => {
    const list = Array.from(new Set(bills.map((b) => b.currency)));
    return list.filter(Boolean);
  }, [bills]);

  // Filtered and sorted bills list
  const filteredAndSortedBills = useMemo(() => {
    return bills
      .filter((b) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesId = b.billNumber.toLowerCase().includes(q);
          const matchesCustomer = (b.client.name || '').toLowerCase().includes(q);
          const matchesCompany = (b.client.company || '').toLowerCase().includes(q);
          const matchesEmail = (b.client.email || '').toLowerCase().includes(q);
          const matchesItem = b.items.some((i) => i.description.toLowerCase().includes(q));
          if (!matchesId && !matchesCustomer && !matchesCompany && !matchesEmail && !matchesItem) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && b.status !== statusFilter) {
          return false;
        }

        // Currency filter
        if (currencyFilter !== 'all' && b.currency !== currencyFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        } else if (sortField === 'dueDate') {
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortField === 'amount') {
          const totalA = calculateBillTotals(a).grandTotal;
          const totalB = calculateBillTotals(b).grandTotal;
          cmp = totalA - totalB;
        } else if (sortField === 'customer') {
          cmp = (a.client.name || '').localeCompare(b.client.name || '');
        } else if (sortField === 'billId') {
          cmp = a.billNumber.localeCompare(b.billNumber);
        }

        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [bills, searchQuery, statusFilter, currencyFilter, sortField, sortDirection]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportBillsToCSV(filteredAndSortedBills);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billcraft_bills_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3" />
            Partial
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            Draft
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const defaultCurrencySym = bills[0]?.currencySymbol || 'Rs.';

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Bill Summary Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Overview of all client invoices, item breakdowns, payment statuses, and outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={bills.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNewBill}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 tabular-nums mt-1">
            {formatCurrency(metrics.totalRevenue, defaultCurrencySym)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across {metrics.totalCount} generated bills
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {formatCurrency(metrics.totalCollected, defaultCurrencySym)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {metrics.paidCount} fully settled bills
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Outstanding Due</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 tabular-nums mt-1">
            {formatCurrency(metrics.totalOutstanding, defaultCurrencySym)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {metrics.pendingCount} pending / awaiting receipt
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-700 tabular-nums mt-1">
            {metrics.overdueCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {metrics.overdueCount > 0 ? 'Requires client follow-up' : 'All accounts current'}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Visualization Section using Recharts */}
      <MonthlyRevenueChart bills={bills} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bill ID, Customer Name, Company, or Item..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Segmented tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-lg shrink-0">
            {(['all', 'paid', 'pending', 'partially_paid', 'overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {st === 'all'
                  ? 'All Statuses'
                  : st === 'partially_paid'
                  ? 'Partial'
                  : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters & Sort order indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {availableCurrencies.length > 1 && (
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-700 focus:outline-none"
              >
                <option value="all">All Currencies</option>
                {availableCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <span className="text-neutral-500">
              Showing <strong className="text-neutral-900 font-semibold">{filteredAndSortedBills.length}</strong> of{' '}
              {bills.length} bills
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Sort by:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(f);
                setSortDirection(d);
              }}
              className="bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-800 focus:outline-none font-medium"
            >
              <option value="date-desc">Date Issued (Newest first)</option>
              <option value="date-asc">Date Issued (Oldest first)</option>
              <option value="dueDate-asc">Due Date (Earliest first)</option>
              <option value="amount-desc">Total Amount Due (High to Low)</option>
              <option value="amount-asc">Total Amount Due (Low to High)</option>
              <option value="customer-asc">Customer Name (A to Z)</option>
              <option value="billId-asc">Bill ID (Ascending)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Bills List Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {filteredAndSortedBills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">
              {bills.length === 0 ? 'No bills created yet' : 'No bills match your current filters'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
              {bills.length === 0
                ? 'Create your first bill to itemize products, calculate taxes, discounts, and generate printable receipts.'
                : 'Try adjusting your search query, status selector, or reset filters to see all invoices.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {bills.length === 0 ? (
                <>
                  <button
                    onClick={onNewBill}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Bill</span>
                  </button>
                  <button
                    onClick={onResetDemoData}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Load Demo Bills</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCurrencyFilter('all');
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 text-[11px] font-semibold uppercase tracking-wider">
                  <th
                    onClick={() => handleSortToggle('billId')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Bill ID</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('customer')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Customer / Client</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('date')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date Issued</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('dueDate')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th
                    onClick={() => handleSortToggle('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Amount Due</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAndSortedBills.map((bill) => {
                  const totals = calculateBillTotals(bill);
                  const sym = bill.currencySymbol || 'Rs.';

                  return (
                    <tr
                      key={bill.id}
                      onClick={() => onSelectBill(bill.id)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Bill ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                        <span className="group-hover:text-neutral-700 underline decoration-neutral-300 underline-offset-2">
                          {bill.billNumber}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-sans font-normal">
                          {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-900">
                          {bill.client.name || 'Anonymous Client'}
                        </p>
                        {bill.client.company ? (
                          <p className="text-neutral-500 text-xs">{bill.client.company}</p>
                        ) : bill.client.email ? (
                          <p className="text-neutral-400 text-xs">{bill.client.email}</p>
                        ) : null}
                      </td>

                      {/* Date Issued */}
                      <td className="py-3.5 px-4 text-neutral-600 tabular-nums font-mono text-xs">
                        {bill.issueDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-neutral-600 tabular-nums font-mono text-xs">
                        {bill.dueDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(bill.status)}
                      </td>

                      {/* Total Amount Due */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(totals.grandTotal, sym)}
                      </td>

                      {/* Remaining Balance Due */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs">
                        {totals.balanceDue > 0 ? (
                          <span className="font-semibold text-amber-700">
                            {formatCurrency(totals.balanceDue, sym)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Settled ($0.00)</span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectBill(bill.id)}
                            title="Edit Bill & Items"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onPrintBill(bill)}
                            title="Print / Save PDF"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicateBill(bill)}
                            title="Duplicate Bill"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete bill ${bill.billNumber}?`)) {
                                onDeleteBill(bill.id);
                              }
                            }}
                            title="Delete Bill"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom helper row */}
      {bills.length > 0 && (
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <p>
            Tip: Click any bill row to open its item pricing calculator and live preview.
          </p>
          <button
            onClick={onResetDemoData}
            className="text-neutral-500 hover:text-neutral-800 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      )}
    </div>
  );
};
