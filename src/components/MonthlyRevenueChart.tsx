import React, { useMemo, useState } from 'react';
import { Bill } from '../types/bill';
import { calculateBillTotals, formatCurrency } from '../utils/calculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, LineChart, Award } from 'lucide-react';

interface MonthlyRevenueChartProps {
  bills: Bill[];
}

interface MonthlyDataPoint {
  monthKey: string;     // e.g. "2026-10"
  monthLabel: string;   // e.g. "Oct 2026"
  billed: number;
  collected: number;
  outstanding: number;
  billCount: number;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ bills }) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Aggregate bills by month
  const { monthlyData, bestMonth, avgMonthlyRevenue, totalBilledAllTime, collectionRate } = useMemo(() => {
    const map = new Map<string, { billed: number; collected: number; outstanding: number; count: number }>();

    bills.forEach((bill) => {
      if (!bill.issueDate) return;
      const key = bill.issueDate.slice(0, 7); // "YYYY-MM"
      const totals = calculateBillTotals(bill);

      const current = map.get(key) || { billed: 0, collected: 0, outstanding: 0, count: 0 };
      current.billed += totals.grandTotal;
      current.collected += totals.amountPaid;
      current.outstanding += totals.balanceDue;
      current.count += 1;
      map.set(key, current);
    });

    // Sort chronologically
    const sortedKeys = Array.from(map.keys()).sort();

    const data: MonthlyDataPoint[] = sortedKeys.map((key) => {
      const item = map.get(key)!;
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        monthKey: key,
        monthLabel: label,
        billed: Math.round(item.billed * 100) / 100,
        collected: Math.round(item.collected * 100) / 100,
        outstanding: Math.round(item.outstanding * 100) / 100,
        billCount: item.count,
      };
    });

    // Best month & metrics
    let best = { monthLabel: 'N/A', billed: 0 };
    let sumBilled = 0;
    let sumCollected = 0;

    data.forEach((d) => {
      sumBilled += d.billed;
      sumCollected += d.collected;
      if (d.billed > best.billed) {
        best = { monthLabel: d.monthLabel, billed: d.billed };
      }
    });

    const avg = data.length > 0 ? sumBilled / data.length : 0;
    const rate = sumBilled > 0 ? (sumCollected / sumBilled) * 100 : 0;

    return {
      monthlyData: data,
      bestMonth: best,
      avgMonthlyRevenue: avg,
      totalBilledAllTime: sumBilled,
      collectionRate: rate,
    };
  }, [bills]);

  const currencySym = bills[0]?.currencySymbol || 'Rs.';

  const formatYAxis = (val: number) => {
    if (val >= 1000) {
      return `${currencySym} ${(val / 1000).toFixed(0)}k`;
    }
    return `${currencySym} ${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-xl border border-neutral-800 text-xs font-sans space-y-1.5 min-w-[190px]">
          <div className="font-semibold text-neutral-200 border-b border-neutral-800 pb-1 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[11px] text-neutral-400 font-normal">
              {dataPoint.billCount} {dataPoint.billCount === 1 ? 'bill' : 'bills'}
            </span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-neutral-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-neutral-200 inline-block" />
                <span>Total Billed:</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-white">
                {formatCurrency(dataPoint.billed, currencySym)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                <span>Collected:</span>
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {formatCurrency(dataPoint.collected, currencySym)}
              </span>
            </div>
            {dataPoint.outstanding > 0 && (
              <div className="flex justify-between items-center text-amber-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
                  <span>Pending / Due:</span>
                </span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(dataPoint.outstanding, currencySym)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (monthlyData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-neutral-600" />
              <span>Monthly Revenue & Invoicing Trends</span>
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Aggregated gross billing, collected revenue, and outstanding client balances across billing months.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              chartType === 'bar'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Comparison</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              chartType === 'area'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Trend Area</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Peak Earning Month</span>
            <span className="font-semibold text-neutral-900">
              {bestMonth.monthLabel} · <span className="font-mono tabular-nums text-neutral-700">{formatCurrency(bestMonth.billed, currencySym)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Average Monthly Billed</span>
            <span className="font-semibold font-mono text-neutral-900 tabular-nums">
              {formatCurrency(avgMonthlyRevenue, currencySym)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
            <span className="text-xs font-bold text-neutral-900">%</span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Realized Collection Rate</span>
            <span className="font-semibold font-mono text-emerald-700 tabular-nums">
              {collectionRate.toFixed(1)}% collected
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="monthLabel"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar
                dataKey="billed"
                name="Total Billed"
                fill="#18181B"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="collected"
                name="Collected Paid"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="monthLabel"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="billed"
                name="Total Billed"
                stroke="#18181B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBilled)"
              />
              <Area
                type="monotone"
                dataKey="collected"
                name="Collected Paid"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCollected)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
