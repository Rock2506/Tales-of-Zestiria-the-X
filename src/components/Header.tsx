import React from 'react';
import { Receipt, Plus, LayoutDashboard, FileText, Users, Printer, DownloadCloud } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'editor' | 'splitter';
  onTabChange: (tab: 'dashboard' | 'editor' | 'splitter') => void;
  onNewBill: () => void;
  activeBillNumber?: string;
  onPrintCurrent?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onNewBill,
  activeBillNumber,
  onPrintCurrent,
  onOpenInstallModal,
}) => {
  return (
    <header className="no-print bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-sm group-hover:bg-neutral-800 transition-colors">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 leading-none block">
                BillCraft
              </span>
              <span className="text-[11px] font-medium text-neutral-500 leading-tight">
                Billing & Payment Calculator
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Bill Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('editor')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'editor'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {activeBillNumber ? `Bill (${activeBillNumber})` : 'Bill Creator'}
            </span>
          </button>

          <button
            onClick={() => onTabChange('splitter')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'splitter'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Split Calculator</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="Install app on mobile or desktop"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-neutral-700" />
              <span>Install App</span>
            </button>
          )}

          {currentTab === 'editor' && onPrintCurrent && (
            <button
              onClick={onPrintCurrent}
              title="Print or Save PDF"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
          )}

          <button
            onClick={onNewBill}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>
      </div>
    </header>
  );
};
