import React, { useState } from 'react';
import { CnnLayerInfo } from '../types';
import { Layers, Activity, HelpCircle } from 'lucide-react';

const CNN_LAYERS: CnnLayerInfo[] = [
  {
    name: 'Input Layer',
    type: 'Input',
    outputShape: '(128, 128, 3)',
    parameters: 0,
    purpose: 'Standardizes all uploaded brain MRI scans to uniform 128×128 pixel dimensions with RGB color channels, normalized to [0, 1].',
  },
  {
    name: 'Conv2D Block 1',
    type: 'Conv2D',
    outputShape: '(128, 128, 32)',
    kernelSize: '3×3',
    filters: 32,
    parameters: 896,
    purpose: 'Detects low-level radiological primitives: skull boundaries, contrast edges, cortical surface contours, and tissue transitions.',
  },
  {
    name: 'BatchNorm & MaxPool 1',
    type: 'MaxPool',
    outputShape: '(64, 64, 32)',
    kernelSize: '2×2',
    parameters: 128,
    purpose: 'Stabilizes gradients and halves spatial resolution from 128×128 to 64×64 while preserving dominant maximum intensity responses.',
  },
  {
    name: 'Conv2D Block 2',
    type: 'Conv2D',
    outputShape: '(64, 64, 64)',
    kernelSize: '3×3',
    filters: 64,
    parameters: 18496,
    purpose: 'Extracts mid-level anatomical structures: ventricular contours, gray/white matter boundaries, and bilateral hemisphere textures.',
  },
  {
    name: 'BatchNorm & MaxPool 2',
    type: 'MaxPool',
    outputShape: '(32, 32, 64)',
    kernelSize: '2×2',
    parameters: 256,
    purpose: 'Reduces spatial resolution from 64×64 to 32×32, ensuring translation invariance across different scanner calibrations.',
  },
  {
    name: 'Conv2D Block 3',
    type: 'Conv2D',
    outputShape: '(32, 32, 128)',
    kernelSize: '3×3',
    filters: 128,
    parameters: 73856,
    purpose: 'Learns high-level pathology markers: hyperintense cranial mass clusters, asymmetric density patterns, and surrounding vasogenic edema.',
  },
  {
    name: 'BatchNorm & MaxPool 3',
    type: 'MaxPool',
    outputShape: '(16, 16, 128)',
    kernelSize: '2×2',
    parameters: 512,
    purpose: 'Compresses feature maps to 16×16×128, isolating localized activation peaks for classification.',
  },
  {
    name: 'Flatten Layer',
    type: 'Flatten',
    outputShape: '(32,768)',
    parameters: 0,
    purpose: 'Unrolls 3D spatial feature tensors into a single 32,768-dimensional feature vector for dense neural connections.',
  },
  {
    name: 'Dense Hidden + Dropout',
    type: 'Dense',
    outputShape: '(128)',
    parameters: 4194432,
    purpose: 'Synthesizes learned convolutional features into high-level medical decision logic. 50% Dropout drops random connections to stop overfitting.',
  },
  {
    name: 'Sigmoid Output Layer',
    type: 'Output',
    outputShape: '(1)',
    parameters: 129,
    purpose: 'Produces a calibrated probability score [0.0, 1.0]. A score ≥ 0.50 triggers Tumor Detected, while < 0.50 denotes Healthy Scan.',
  },
];

export const CnnVisualizer: React.FC = () => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(1);
  const [currentEpoch, setCurrentEpoch] = useState<number>(15);

  const selectedLayer = CNN_LAYERS[selectedLayerIndex];

  // Calculate training progression metrics based on epoch slider
  const trainLoss = (0.68 * Math.exp(-currentEpoch * 0.16) + 0.08).toFixed(4);
  const valLoss = (0.72 * Math.exp(-currentEpoch * 0.14) + 0.12).toFixed(4);
  const trainAcc = Math.min(99.2, 58 + 41 * (1 - Math.exp(-currentEpoch * 0.22))).toFixed(1);
  const valAcc = Math.min(96.4, 55 + 40 * (1 - Math.exp(-currentEpoch * 0.20))).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block mb-1">
            Deep Learning Architecture
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Convolutional Neural Network Pipeline for MRI Classification
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            The model uses three sequential convolutional feature-extraction blocks followed by a regularized dense classification head. Training and inference use the exact same standardized resolution of <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">128 × 128 × 3</code>.
          </p>
        </div>

        {/* Global Architecture KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Parameters</span>
            <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">4,288,673</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Convolutional Blocks</span>
            <span className="text-lg font-mono font-bold text-sky-700 tabular-nums">3 Stages</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Regularization</span>
            <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">50% Dropout</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Loss Function</span>
            <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">Binary Cross-Entropy</span>
          </div>
        </div>
      </div>

      {/* Main Layer Inspector & Training Curve Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Layer Flow Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Network Flow Sequence
            </span>
            <span className="text-xs text-slate-400">Click layer to inspect weights</span>
          </div>

          <div className="space-y-2">
            {CNN_LAYERS.map((layer, idx) => {
              const isSelected = selectedLayerIndex === idx;
              return (
                <button
                  key={layer.name}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {layer.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {layer.type} · {layer.kernelSize ? `Kernel ${layer.kernelSize}` : 'Linear'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-semibold text-slate-800 block tabular-nums">
                      {layer.outputShape}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {layer.parameters.toLocaleString()} params
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layer Details & Training Curve Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selected Layer Inspector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Layer Inspection
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200">
                Layer #{selectedLayerIndex + 1}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedLayer.name}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {selectedLayer.purpose}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Output Tensor</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {selectedLayer.outputShape}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Trainable Parameters</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {selectedLayer.parameters.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Training Curve Simulation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Training Progression Monitor
              </span>
              <span className="text-xs font-mono text-slate-500">
                Epoch {currentEpoch}/15
              </span>
            </div>

            {/* Epoch scrubber slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Scrub Epochs</span>
                <span className="font-mono font-semibold">Epoch {currentEpoch}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={currentEpoch}
                onChange={(e) => setCurrentEpoch(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Simulated Loss & Accuracy Telemetry */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 block">Train Accuracy</span>
                <span className="text-lg font-mono font-bold text-sky-700 tabular-nums">
                  {trainAcc}%
                </span>
                <span className="text-[10px] text-slate-400 block">Loss: {trainLoss}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 block">Validation Accuracy</span>
                <span className="text-lg font-mono font-bold text-emerald-700 tabular-nums">
                  {valAcc}%
                </span>
                <span className="text-[10px] text-slate-400 block">Val Loss: {valLoss}</span>
              </div>
            </div>

            {/* Best Practice Note */}
            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg text-[11px] text-sky-900 leading-relaxed">
              <strong>Medical CNN Best Practice:</strong> Early stopping with <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-200">patience=5</code> restores the highest validation accuracy weights to protect against memorizing idiosyncratic scanner noise.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
