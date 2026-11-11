/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavTab } from './types';
import { TopBar } from './components/TopBar';
import { DiagnosticLab } from './components/DiagnosticLab';
import { CnnVisualizer } from './components/CnnVisualizer';
import { CodeStudio } from './components/CodeStudio';
import { SetupGuide } from './components/SetupGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('diagnostic');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navigation Bar adhering to the Top Bar Contract */}
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-7">
        {activeTab === 'diagnostic' && (
          <DiagnosticLab
            onGoToCode={() => setActiveTab('code-studio')}
            onGoToGuide={() => setActiveTab('setup-guide')}
          />
        )}

        {activeTab === 'cnn-architecture' && <CnnVisualizer />}

        {activeTab === 'code-studio' && <CodeStudio />}

        {activeTab === 'setup-guide' && <SetupGuide />}
      </main>

      {/* Quiet, compliant medical footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">NeuroScan AI</span>
            <span>·</span>
            <span>Deep Learning Brain MRI Classifier</span>
            <span>·</span>
            <span>Python 3.12 & Streamlit</span>
          </div>
          <div>
            <span>Educational Research Prototype — Not for Clinical Diagnostic Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
