import { SampleScan } from '../types';

export const SAMPLE_SCANS: SampleScan[] = [
  {
    id: 'scan-1',
    name: 'Patient #4082 - Axial T1+C',
    category: 'tumor',
    modality: 'T1-Weighted Contrast Enhanced (Axial)',
    imageUrl: '/src/assets/images/mri_tumor_axial_scan_1794378148914.jpg',
    groundTruthLabel: 'High-Grade Glioblastoma Lesion',
    expectedConfidence: 96.8,
    clinicalNotes: 'Marked ring-enhancing hyperintense mass located in the right frontotemporal region with extensive perifocal vasogenic edema and midline shift.',
    lesionBox: {
      x: 18,
      y: 42,
      width: 28,
      height: 26,
    },
    lesionCenter: {
      x: 32,
      y: 55,
    },
  },
  {
    id: 'scan-2',
    name: 'Patient #1290 - Axial T2 Symmetrical',
    category: 'no-tumor',
    modality: 'T2-Weighted FSE (Axial)',
    imageUrl: '/src/assets/images/mri_healthy_axial_scan_1794378148352.jpg',
    groundTruthLabel: 'Healthy / No Mass Effect',
    expectedConfidence: 98.4,
    clinicalNotes: 'Clear bilateral cerebral hemisphere symmetry, patent lateral ventricles, absence of abnormal signal intensity or structural midline compression.',
  },
  {
    id: 'scan-3',
    name: 'Patient #8814 - Sagittal T2-SE',
    category: 'tumor',
    modality: 'T2-SE (Sagittal View)',
    imageUrl: '/src/assets/images/mri_meningioma_scan_1794378149017.jpg',
    groundTruthLabel: 'Convexity Parasagittal Meningioma',
    expectedConfidence: 94.2,
    clinicalNotes: 'Well-circumscribed extra-axial hyperintense mass abutting the parietal inner skull table with characteristic dural tail thickening.',
    lesionBox: {
      x: 64,
      y: 22,
      width: 24,
      height: 24,
    },
    lesionCenter: {
      x: 76,
      y: 34,
    },
  },
];
