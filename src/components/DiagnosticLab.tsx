import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { AnalysisResult, SampleScan } from '../types';
import { analyzeMriImage } from '../utils/imageAnalysis';
import {
  Upload,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Eye,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

interface DiagnosticLabProps {
  onGoToCode: () => void;
  onGoToGuide: () => void;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({ onGoToCode, onGoToGuide }) => {
  const [selectedSample, setSelectedSample] = useState<SampleScan | null>(SAMPLE_SCANS[0]);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(SAMPLE_SCANS[0].imageUrl);
  const [imageFileName, setImageFileName] = useState<string>('sample_glioblastoma_t1c.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Visual overlay and radiological controls
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [invertColors, setInvertColors] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run analysis when image changes
  useEffect(() => {
    let isCancelled = false;
    const runInference = async () => {
      if (!currentImageSrc) {
        setAnalysisResult(null);
        return;
      }
      setIsAnalyzing(true);
      try {
        const result = await analyzeMriImage(currentImageSrc, {
          sampleScan: selectedSample || undefined,
        });
        if (!isCancelled) {
          setAnalysisResult(result);
        }
      } catch (err) {
        console.error('Inference error:', err);
      } finally {
        if (!isCancelled) {
          setIsAnalyzing(false);
        }
      }
    };

    runInference();
    return () => {
      isCancelled = true;
    };
  }, [currentImageSrc, selectedSample]);

  // Handle local user upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      alert('Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setSelectedSample(null);
      setImageFileName(file.name);
      setCurrentImageSrc(src);
    };
    reader.readAsDataURL(file);
  };

  // Reset analysis
  const handleReset = () => {
    setSelectedSample(null);
    setCurrentImageSrc('');
    setImageFileName('');
    setAnalysisResult(null);
    setBrightness(100);
    setContrast(100);
    setInvertColors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectSample = (sample: SampleScan) => {
    setSelectedSample(sample);
    setCurrentImageSrc(sample.imageUrl);
    setImageFileName(`${sample.id}.jpg`);
  };

  return (
    <div className="space-y-6">
      {/* Educational Medical Disclaimer Banner */}
      <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-4 flex items-start gap-3 text-sky-950">
        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 text-sky-700 mt-0.5">
          <Activity className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-sky-900">
            Educational Deep Learning Prototype — Not a Medical Diagnosis Device
          </p>
          <p className="text-sky-800/90 leading-relaxed">
            This system demonstrates convolutional neural network (CNN) feature extraction and binary classification (Tumor vs. No Tumor) using TensorFlow and Streamlit. All findings must be confirmed by qualified medical professionals.
          </p>
        </div>
      </div>

      {/* Main Two-Column Clinical Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Input & Inspection Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sample MRI Case Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clinical Test Cases
              </span>
              <span className="text-xs text-slate-400">1-Click Immediate Evaluation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_SCANS.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sample.category === 'tumor' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {sample.name.split(' - ')[0]}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {sample.category === 'tumor' ? 'Tumor Case' : 'Healthy Control'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MRI Viewport Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Viewport Top Controls */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-700">MRI SCAN VIEWPORT</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-mono text-slate-500 truncate">
                  {imageFileName || 'No file selected'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded transition-colors"
                  title="Clear scan and reset viewport"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Scan</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Viewport Display Canvas Area */}
            <div className="relative bg-slate-950 aspect-square w-full max-h-[440px] flex items-center justify-center overflow-hidden select-none">
              {currentImageSrc ? (
                <div
                  className="relative w-full h-full flex items-center justify-center p-3"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                      invertColors ? 'invert(1)' : ''
                    }`,
                  }}
                >
                  {/* Base MRI Image */}
                  <img
                    src={currentImageSrc}
                    alt="Brain MRI Scan"
                    className="max-h-full max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />

                  {/* Grad-CAM Activation Heatmap Overlay */}
                  {showHeatmap && analysisResult?.heatmapDataUrl && (
                    <img
                      src={analysisResult.heatmapDataUrl}
                      alt="Grad-CAM Activation Heatmap"
                      className="absolute inset-0 m-auto max-h-full max-w-full object-contain pointer-events-none mix-blend-screen"
                      style={{ opacity: heatmapOpacity }}
                    />
                  )}

                  {/* Bounding Box Overlay for localized lesions */}
                  {showBoundingBox && analysisResult?.boundingBox && analysisResult.outcome === 'tumor' && (
                    <div
                      className="absolute border-2 border-rose-500 rounded pointer-events-none transition-all shadow-sm"
                      style={{
                        left: `${analysisResult.boundingBox.x}%`,
                        top: `${analysisResult.boundingBox.y}%`,
                        width: `${analysisResult.boundingBox.width}%`,
                        height: `${analysisResult.boundingBox.height}%`,
                      }}
                    >
                      <div className="absolute -top-5 left-0 bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                        Lesion Cluster
                      </div>
                      <div className="absolute inset-0 bg-rose-500/15" />
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Upload State */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Upload Brain MRI Image (JPG, JPEG, PNG)
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Drag and drop an axial, coronal, or sagittal brain scan or click to browse.
                  </p>
                  <span className="mt-4 px-3 py-1.5 text-xs font-medium text-sky-400 bg-sky-950/60 border border-sky-800/80 rounded-md">
                    Or select a clinical test case above
                  </span>
                </div>
              )}

              {/* In-viewport scan orientation labels (Medical standard: Right / Left markers) */}
              {currentImageSrc && (
                <>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400/80 bg-slate-900/60 px-1.5 py-0.5 rounded">
                    R
                  </span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400/80 bg-slate-900/60 px-1.5 py-0.5 rounded">
                    L
                  </span>
                  <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-400/80 bg-slate-900/60 px-1.5 py-0.5 rounded">
                    A (Anterior)
                  </span>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-400/80 bg-slate-900/60 px-1.5 py-0.5 rounded">
                    P (Posterior)
                  </span>
                </>
              )}
            </div>

            {/* Radiological Layer Controls */}
            {currentImageSrc && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  {/* Layer Toggles */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                        showHeatmap
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Grad-CAM Heatmap</span>
                    </button>
                    <button
                      onClick={() => setShowBoundingBox(!showBoundingBox)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                        showBoundingBox
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lesion Box</span>
                    </button>
                    <button
                      onClick={() => setInvertColors(!invertColors)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                        invertColors
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span>Invert Window</span>
                    </button>
                  </div>

                  {/* Heatmap Opacity Slider */}
                  {showHeatmap && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Heatmap Opacity:</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={heatmapOpacity}
                        onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                        className="w-24 accent-sky-600"
                      />
                      <span className="font-mono text-[11px] text-slate-600 w-8">
                        {Math.round(heatmapOpacity * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Brightness & Contrast fine adjustments */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    <span>Brightness</span>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="flex-1 accent-slate-600"
                    />
                    <span className="font-mono w-7 text-right">{brightness}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    <span>Contrast</span>
                    <input
                      type="range"
                      min="60"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="flex-1 accent-slate-600"
                    />
                    <span className="font-mono w-7 text-right">{contrast}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deep Learning Diagnostic Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Classification Outcome Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                CNN Inference Output
              </span>
              <span className="text-xs font-mono text-slate-400">
                Sigmoid Cutoff: 0.50
              </span>
            </div>

            {isAnalyzing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Evaluating MRI Slice...</p>
                <p className="text-xs text-slate-400 font-mono">
                  Preprocessing to 128×128×3 & extracting convolutional features
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-5">
                {/* Primary Outcome Banner */}
                <div
                  className={`rounded-xl p-4 border ${
                    analysisResult.outcome === 'tumor'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {analysisResult.outcome === 'tumor' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {analysisResult.outcome === 'tumor'
                          ? 'Positive Indication'
                          : 'Negative Indication'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      T={analysisResult.inferenceDurationMs}ms
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    {analysisResult.outcome === 'tumor'
                      ? 'Tumor Detected'
                      : 'No Tumor Detected'}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {analysisResult.primaryFinding}
                  </p>
                </div>

                {/* Confidence Gauge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Confidence Score</span>
                    <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                      {analysisResult.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analysisResult.outcome === 'tumor' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, analysisResult.confidence))}%` }}
                    />
                  </div>
                </div>

                {/* Probability Distribution Split */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block">Tumor Probability</span>
                    <span className="text-lg font-mono font-bold text-rose-700 tabular-nums mt-0.5 block">
                      {analysisResult.tumorProbability.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block">Healthy Probability</span>
                    <span className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-0.5 block">
                      {analysisResult.healthyProbability.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Radiological Observations */}
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-700 block">Radiological Findings</span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Anatomical Region:</span>
                      <span className="font-medium text-slate-800">{analysisResult.anatomicalRegion}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Bilateral Symmetry Index:</span>
                      <span className="font-mono text-slate-800">{analysisResult.symmetryIndex}%</span>
                    </div>
                    {analysisResult.detailedNotes.map((note, idx) => (
                      <p key={idx} className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/50">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                Upload or select an MRI scan to view classification results.
              </div>
            )}
          </div>

          {/* Technical Deep Learning Specifications Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              CNN Model Specifications
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Input Shape</span>
                <span className="font-semibold text-slate-800">128 × 128 × 3</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Target Metric</span>
                <span className="font-semibold text-slate-800">Binary Accuracy</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Output Activation</span>
                <span className="font-semibold text-slate-800">Sigmoid (0.0 - 1.0)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Saved Artifact</span>
                <span className="font-semibold text-slate-800 truncate">brain_tumor_model.keras</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={onGoToCode}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Python Code</span>
              </button>
              <button
                onClick={onGoToGuide}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <span>Training Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
