import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES } from '../data/pythonProjectFiles';
import { downloadProjectZip } from '../utils/exportZip';
import { Copy, Check, Download, FileCode, FolderArchive } from 'lucide-react';

export const CodeStudio: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const currentFile = PYTHON_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip();
    } finally {
      setTimeout(() => setIsZipping(false), 800);
    }
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Code Studio Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block mb-1">
            Complete Project Source Code
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Python 3.12 · Streamlit · TensorFlow / Keras
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All files are fully functional, production-ready, and can be executed directly in your local Python environment.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg transition-colors shadow-xs disabled:opacity-60 whitespace-nowrap self-start md:self-auto"
        >
          <FolderArchive className="w-4 h-4" />
          <span>{isZipping ? 'Generating ZIP...' : 'Download Project ZIP'}</span>
        </button>
      </div>

      {/* Main File Explorer & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Tabs (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Project Structure
            </span>
            <span className="text-[11px] font-mono text-slate-400">brain_tumor_detection/</span>
          </div>

          <div className="space-y-1.5">
            {PYTHON_PROJECT_FILES.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 truncate">
                        {file.filename}
                      </span>
                      {file.badge && (
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {file.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick dataset folder note */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1 mt-4">
            <span className="font-semibold text-slate-800 block">Dataset Directory:</span>
            <p className="text-slate-500">
              <code>dataset/yes/</code> (Tumor scans)
              <br />
              <code>dataset/no/</code> (Healthy scans)
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          {/* Editor Header Bar */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                {currentFile.path}
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-[11px] font-mono text-slate-400">
                {lines.length} lines
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-sky-300 hover:text-sky-200 bg-sky-950/70 hover:bg-sky-900/70 border border-sky-800/80 rounded transition-colors"
                title="Download this single file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Code Body with Line Numbers */}
          <div className="p-4 overflow-x-auto max-h-[620px] text-xs font-mono leading-relaxed select-text">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="pr-4 text-right text-slate-600 select-none w-10 align-top">
                      {idx + 1}
                    </td>
                    <td className="text-slate-300 whitespace-pre font-mono">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
