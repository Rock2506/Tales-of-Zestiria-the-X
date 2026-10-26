import React, { useState, useEffect } from 'react';
import { Bill } from './types/bill';
import { createNewBlankBill, getSampleInitialBills } from './utils/calculations';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BillEditor } from './components/BillEditor';
import { BillSplitter } from './components/BillSplitter';
import { BillPreviewSheet } from './components/BillPreviewSheet';
import { InstallGuideModal } from './components/InstallGuideModal';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'billcraft_bills_pkr_v2';

export default function App() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored bills:', e);
    }
    return getSampleInitialBills();
  });

  const [activeBillId, setActiveBillId] = useState<string>(() => {
    return bills[0]?.id || '';
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'editor' | 'splitter'>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    } catch (e) {
      console.error('Failed to persist bills:', e);
    }
  }, [bills]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeBill = bills.find((b) => b.id === activeBillId) || bills[0] || createNewBlankBill();

  // Create new bill
  const handleNewBill = () => {
    const nextNumber = `INV-2026-${100 + bills.length + 1}`;
    const newBill = createNewBlankBill(nextNumber);
    setBills((prev) => [newBill, ...prev]);
    setActiveBillId(newBill.id);
    setCurrentTab('editor');
    showToast(`Created new invoice ${newBill.billNumber}`);
  };

  // Select bill to edit
  const handleSelectBill = (billId: string) => {
    setActiveBillId(billId);
    setCurrentTab('editor');
  };

  // Update current active bill
  const handleUpdateActiveBill = (updated: Bill) => {
    setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // Duplicate a bill
  const handleDuplicateBill = (billToClone: Bill) => {
    const nextNum = `${billToClone.billNumber}-COPY`;
    const cloned: Bill = {
      ...billToClone,
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      billNumber: nextNum,
      createdAt: new Date().toISOString(),
      issueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      amountPaid: 0,
      cashTendered: 0,
    };
    setBills((prev) => [cloned, ...prev]);
    setActiveBillId(cloned.id);
    setCurrentTab('editor');
    showToast(`Duplicated as ${nextNum}`);
  };

  // Delete a bill
  const handleDeleteBill = (billId: string) => {
    setBills((prev) => prev.filter((b) => b.id !== billId));
    showToast('Bill deleted successfully');
  };

  // Reset to initial demo bills
  const handleResetDemoData = () => {
    const demo = getSampleInitialBills();
    setBills(demo);
    setActiveBillId(demo[0].id);
    showToast('Demo bills loaded');
  };

  // Print handler
  const handlePrint = (billToPrint?: Bill) => {
    if (billToPrint && billToPrint.id !== activeBillId) {
      setActiveBillId(billToPrint.id);
    }
    // Small timeout to allow state to sync if needed before print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewBill={handleNewBill}
        activeBillNumber={activeBill?.billNumber}
        onPrintCurrent={() => handlePrint(activeBill)}
        onOpenInstallModal={() => setShowInstallModal(true)}
      />

      {/* Install Guide Modal */}
      <InstallGuideModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Main Content Area */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            bills={bills}
            onSelectBill={handleSelectBill}
            onNewBill={handleNewBill}
            onDuplicateBill={handleDuplicateBill}
            onDeleteBill={handleDeleteBill}
            onResetDemoData={handleResetDemoData}
            onPrintBill={handlePrint}
          />
        )}

        {currentTab === 'editor' && (
          <BillEditor
            bill={activeBill}
            onChange={handleUpdateActiveBill}
            onSave={() => {
              showToast(`Bill ${activeBill.billNumber} saved`);
              setCurrentTab('dashboard');
            }}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onPrint={() => handlePrint(activeBill)}
          />
        )}

        {currentTab === 'splitter' && (
          <BillSplitter bills={bills} activeBill={activeBill} />
        )}
      </main>

      {/* Dedicated Clean Sheet for Browser Print (Appears ONLY during print) */}
      <div className="hidden print:block print-sheet">
        {activeBill && <BillPreviewSheet bill={activeBill} />}
      </div>

      {/* Footer */}
      <footer className="no-print border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">BillCraft</span>
            <span aria-hidden="true">·</span>
            <span>Accurate Item Pricing & Payment Calculation</span>
          </div>
          <div>
            <span>All calculations performed with 2-decimal rounded precision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
