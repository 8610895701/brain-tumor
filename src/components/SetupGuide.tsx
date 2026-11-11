import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-slate-900 rounded-lg p-3.5 font-mono text-xs text-slate-200 border border-slate-800">
      <pre className="overflow-x-auto whitespace-pre pr-12">{code}</pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        title="Copy command"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export const SetupGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block mb-1">
          Step-by-Step Beginner Guide
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Running the Brain Tumor Detection App Locally
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Follow these exact execution commands to train the CNN and run the Streamlit web dashboard in Python 3.12 on your local computer.
        </p>
      </div>

      {/* Step 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-mono">
            1
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Create and Activate a Virtual Environment
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Open your terminal, navigate to the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">brain_tumor_detection/</code> folder, and create an isolated virtual environment:
        </p>
        
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            On macOS / Linux:
          </span>
          <CodeSnippet code={`python3 -m venv venv\nsource venv/bin/activate`} />
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            On Windows (Command Prompt / PowerShell):
          </span>
          <CodeSnippet code={`python -m venv venv\nvenv\\Scripts\\activate`} />
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-mono">
            2
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Install Dependencies via pip
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Install the verified Python 3.12 packages (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">streamlit</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">tensorflow</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">numpy</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">pillow</code>):
        </p>
        <CodeSnippet code={`pip install --upgrade pip\npip install -r requirements.txt`} />
      </div>

      {/* Step 3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-mono">
            3
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Prepare the MRI Dataset
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          You need an image directory structured with two subfolders: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dataset/yes/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dataset/no/</code>. Choose either method:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Option A: Instant Sample Generator
            </span>
            <p className="text-[11px] text-slate-500">
              Generates 50 realistic axial brain slices right away so you can start training without downloading external files:
            </p>
            <CodeSnippet code={`python generate_sample_dataset.py`} />
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Option B: Real Kaggle Medical Dataset
            </span>
            <p className="text-[11px] text-slate-500">
              Download the standard Kaggle dataset containing 253 real clinical MRI scans:
            </p>
            <a
              href="https://www.kaggle.com/datasets/navoneel/brain-mri-images-for-brain-tumor-detection"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              <span>Kaggle Brain MRI Dataset</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-[11px] text-slate-400">
              Extract and copy the <code>yes/</code> and <code>no/</code> folders into <code>dataset/</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-mono">
            4
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Train the CNN Model
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Run the training pipeline. The script will resize images to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">128×128</code>, perform data augmentation, train for 15 epochs, and save the best model weights to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">brain_tumor_model.keras</code>:
        </p>
        <CodeSnippet code={`python train.py --epochs 15 --batch_size 16`} />
      </div>

      {/* Step 5 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-mono">
            5
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Launch the Streamlit Web Application
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Start the Streamlit user interface:
        </p>
        <CodeSnippet code={`streamlit run app.py`} />
        <p className="text-xs text-slate-500 pt-1">
          Streamlit will open automatically in your default browser at <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">http://localhost:8501</code>.
        </p>
      </div>

      {/* Troubleshooting Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Troubleshooting Common Issues
          </h3>
        </div>

        <div className="space-y-2.5 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block">
              "brain_tumor_model.keras not found" Warning in app.py
            </span>
            <p className="text-slate-600 mt-0.5">
              Run <code>python train.py</code> to train and save the model file. Until trained, <code>app.py</code> provides a fallback demo diagnostic mode so you can preview the UI.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block">
              TensorFlow Installation on Apple Silicon (M1/M2/M3)
            </span>
            <p className="text-slate-600 mt-0.5">
              Standard <code>pip install tensorflow</code> runs natively on macOS. For Metal GPU acceleration on Mac, install <code>pip install tensorflow-metal</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
