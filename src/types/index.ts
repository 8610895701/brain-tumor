export type NavTab = 'diagnostic' | 'cnn-architecture' | 'code-studio' | 'setup-guide';

export type DiagnosticOutcome = 'tumor' | 'no-tumor';

export interface SampleScan {
  id: string;
  name: string;
  category: 'tumor' | 'no-tumor';
  modality: string;
  imageUrl: string;
  groundTruthLabel: string;
  expectedConfidence: number;
  clinicalNotes: string;
  lesionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  lesionCenter?: {
    x: number;
    y: number;
  };
}

export interface AnalysisResult {
  outcome: DiagnosticOutcome;
  confidence: number;
  tumorProbability: number;
  healthyProbability: number;
  primaryFinding: string;
  detailedNotes: string[];
  anatomicalRegion: string;
  anomalyScore: number;
  symmetryIndex: number;
  inferenceDurationMs: number;
  timestamp: string;
  heatmapDataUrl?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PythonProjectFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
  badge?: string;
}

export interface CnnLayerInfo {
  name: string;
  type: 'Input' | 'Conv2D' | 'BatchNorm' | 'MaxPool' | 'Flatten' | 'Dense' | 'Dropout' | 'Output';
  outputShape: string;
  kernelSize?: string;
  filters?: number;
  parameters: number;
  purpose: string;
}
