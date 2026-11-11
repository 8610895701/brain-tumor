import React from 'react';
import { NavTab } from '../types';
import { Download, Brain } from 'lucide-react';
import { downloadProjectZip } from '../utils/exportZip';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('diagnostic')}
          className="flex items-center gap-2.5 text-slate-900 font-bold tracking-tight text-lg whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Brain className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span>NeuroScan AI</span>
        </button>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onTabChange('diagnostic')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'diagnostic'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            Diagnostic Lab
          </button>
          <button
            onClick={() => onTabChange('cnn-architecture')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'cnn-architecture'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            CNN Architecture
          </button>
          <button
            onClick={() => onTabChange('code-studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'code-studio'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            Python Code Studio
          </button>
          <button
            onClick={() => onTabChange('setup-guide')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'setup-guide'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            Setup Guide
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Packing .ZIP...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
