import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from '../data/pythonProjectFiles';

/**
 * Bundles the complete brain_tumor_detection directory into a zip archive
 * and triggers immediate browser download.
 */
export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('brain_tumor_detection');

  if (!folder) {
    throw new Error('Failed to create zip folder');
  }

  // Add all source code files
  for (const file of PYTHON_PROJECT_FILES) {
    folder.file(file.filename, file.content);
  }

  // Create empty dataset directories representation
  const datasetFolder = folder.folder('dataset');
  if (datasetFolder) {
    datasetFolder.folder('yes')?.file('README.txt', 'Place MRI scans showing tumors in this folder (or run generate_sample_dataset.py)');
    datasetFolder.folder('no')?.file('README.txt', 'Place healthy brain MRI scans in this folder (or run generate_sample_dataset.py)');
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'brain_tumor_detection_python_project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
