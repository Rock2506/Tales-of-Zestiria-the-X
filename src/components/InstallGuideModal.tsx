import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  DownloadCloud,
  Smartphone,
  Laptop,
  Apple,
  Chrome,
  X,
  Check,
  Share2,
  PlusSquare,
  Terminal,
  HelpCircle
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activePlatform, setActivePlatform] = useState<'mobile' | 'ios' | 'pc' | 'local'>('mobile');

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 text-neutral-900 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Install BillCraft App
            </h2>
            <p className="text-xs text-neutral-500">
              Install directly on your phone or computer to create bills anytime with offline support.
            </p>
          </div>
        </div>

        {/* One-click install banner if browser supports it */}
        {isInstallable && (
          <div className="p-3.5 bg-neutral-900 text-white rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold">1-Click Direct Install</p>
              <p className="text-[11px] text-neutral-400">Add to your device home screen / desktop</p>
            </div>
            <button
              onClick={handleNativeInstall}
              className="px-4 py-2 text-xs font-bold bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>App is already installed on this device! You can launch it from your home screen.</span>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActivePlatform('mobile')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activePlatform === 'mobile' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activePlatform === 'ios' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / Safari</span>
          </button>

          <button
            onClick={() => setActivePlatform('pc')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activePlatform === 'pc' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>PC / Windows / Mac</span>
          </button>

          <button
            onClick={() => setActivePlatform('local')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activePlatform === 'local' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run Locally</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-xs space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          {activePlatform === 'mobile' && (
            <div className="space-y-2">
              <p className="font-semibold text-neutral-900">How to install on Android phone / Chrome:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 leading-relaxed">
                <li>
                  Open this website in <strong>Google Chrome</strong> or <strong>Edge</strong> on your phone.
                </li>
                <li>
                  Tap the <strong>three dots (⋮)</strong> menu icon at the top right of the browser.
                </li>
                <li>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Confirm <strong>"Install"</strong>. The app icon will appear right on your phone's home screen!
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-2">
              <p className="font-semibold text-neutral-900">How to install on iPhone or iPad:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 leading-relaxed">
                <li>
                  Open this app URL in <strong>Apple Safari</strong> browser on your iPhone.
                </li>
                <li>
                  Tap the <strong className="inline-flex items-center gap-1"><Share2 className="w-3 h-3 inline" /> Share</strong> button at the bottom of the screen.
                </li>
                <li>
                  Scroll down and tap <strong className="inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 inline" /> Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong>Add</strong> at the top right. BillCraft will open like a native app with no browser address bar!
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'pc' && (
            <div className="space-y-2">
              <p className="font-semibold text-neutral-900">How to install on Windows PC or Mac:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 leading-relaxed">
                <li>
                  Open this app in <strong>Google Chrome</strong>, <strong>Brave</strong>, or <strong>Microsoft Edge</strong>.
                </li>
                <li>
                  Look at the right side of the URL address bar at the top for the <strong className="inline-flex items-center gap-1"><DownloadCloud className="w-3 h-3 inline" /> Install App</strong> icon.
                </li>
                <li>
                  Click <strong>Install</strong>. It creates a desktop shortcut and opens in its own window.
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'local' && (
            <div className="space-y-2">
              <p className="font-semibold text-neutral-900">How to run on your own PC using code:</p>
              <div className="bg-neutral-900 text-neutral-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                <p className="text-neutral-400"># 1. Download or clone this code repository</p>
                <p className="text-neutral-400"># 2. Install dependencies:</p>
                <p className="text-emerald-400">npm install</p>
                <p className="text-neutral-400"># 3. Start development server:</p>
                <p className="text-emerald-400">npm run dev</p>
              </div>
              <p className="text-[11px] text-neutral-500">
                Open <code className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">http://localhost:3000</code> in your browser!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
