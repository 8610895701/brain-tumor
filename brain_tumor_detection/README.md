# 🧠 Brain Tumor Detection Web Application

An educational, beginner-friendly Deep Learning web application for detecting brain tumors from MRI scans using a Convolutional Neural Network (CNN), TensorFlow/Keras, and Streamlit.

---

## 📋 Features

- **Intuitive Medical Interface:** Light blue and white medical dashboard built with Streamlit.
- **MRI Image Upload:** Supports `.jpg`, `.jpeg`, and `.png` brain MRI images (axial, coronal, sagittal).
- **Binary Detection:** Accurately classifies scans as **Tumor Detected** or **No Tumor Detected**.
- **Confidence Metrics:** Displays diagnostic percentage score, probability distribution, and input tensor resolution.
- **Preprocessed Scan Preview:** Shows uploaded MRI scan alongside diagnostic findings.
- **Reset Functionality:** Instant reset button to test multiple scans.
- **Error Handling:** Gracefully handles missing model files and unreadable/corrupt image formats.
- **Educational Prototype:** Clearly labeled for research and educational purposes.

---

## 🗂️ Project Structure

```
brain_tumor_detection/
├── app.py                      # Streamlit interactive web application
├── model.py                    # CNN architecture & image preprocessing helpers
├── train.py                    # TensorFlow training pipeline & evaluation
├── generate_sample_dataset.py  # Quick sample dataset generator for instant testing
├── requirements.txt            # Python 3.12 compatible dependencies
├── README.md                   # Full documentation & setup instructions
└── dataset/                    # Training image directory
    ├── yes/                    # Brain MRI scans containing tumors
    └── no/                     # Healthy brain MRI scans
```

---

## ⚙️ Prerequisites & Compatibility

- **Python Version:** Python 3.12 (or Python 3.10 / 3.11)
- **Operating System:** Windows, macOS, or Linux
- **GPU (Optional):** NVIDIA GPU with CUDA or Apple Silicon MPS; runs smoothly on CPU as well.

---

## 🚀 Step-by-Step Installation & Quickstart

### Step 1: Clone or Navigate to the Project Directory

```bash
cd brain_tumor_detection
```

### Step 2: Create and Activate a Virtual Environment

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📊 Dataset Setup

You need MRI images organized into `dataset/yes/` and `dataset/no/`. You have two easy options:

### Option A: Quick Starter Dataset (Instant Setup)

Run our built-in generator script to synthesize 50 starter brain MRI slices immediately:

```bash
python generate_sample_dataset.py
```

This will automatically create:
- `dataset/yes/` (25 scans with simulated hyperintense cranial lesions)
- `dataset/no/` (25 scans of healthy symmetrical brain tissue)

### Option B: Public Kaggle MRI Dataset (Real Clinical Scans)

To use real medical MRI scans:
1. Download the public [Kaggle Brain MRI Images for Brain Tumor Detection Dataset](https://www.kaggle.com/datasets/navoneel/brain-mri-images-for-brain-tumor-detection) (by Navoneel Chakrabarty).
2. Extract the archive.
3. Place the `yes/` and `no/` folders directly into the `dataset/` directory:
   ```
   dataset/
   ├── yes/   # ~155 images
   └── no/    # ~98 images
   ```

---

## 🏋️ Model Training

Train the Convolutional Neural Network by running `train.py`:

```bash
python train.py --epochs 15 --batch_size 16
```

### What Happens During Training:
1. Images are loaded and resized to uniform `128x128` pixels with RGB channels.
2. Data is split into **80% training** and **20% validation**.
3. Real-time data augmentation (horizontal flip, subtle rotation, zoom) is applied.
4. Model trains with `Adam` optimizer and `binary_crossentropy` loss.
5. The best-performing model checkpoint is saved to:
   ```
   brain_tumor_model.keras
   ```

---

## 🌐 Running the Web Application

Launch the Streamlit web dashboard:

```bash
streamlit run app.py
```

Streamlit will print the local URL in your terminal:
```
Local URL: http://localhost:8501
Network URL: http://192.168.x.x:8501
```

Open this link in your web browser, upload any `.jpg` or `.png` brain MRI scan, and review the classification and confidence score!

---

## 🧠 CNN Model Architecture

The network in `model.py` is tailored for medical binary classification:

1. **Input Layer:** `(128, 128, 3)` normalized pixel tensor `[0.0, 1.0]`.
2. **Conv Block 1:** 32 filters `(3×3)` + Batch Normalization + ReLU + MaxPool `(2×2)`.
3. **Conv Block 2:** 64 filters `(3×3)` + Batch Normalization + ReLU + MaxPool `(2×2)`.
4. **Conv Block 3:** 128 filters `(3×3)` + Batch Normalization + ReLU + MaxPool `(2×2)`.
5. **Flatten Layer:** Reshapes 2D feature maps into a 1D vector.
6. **Dense Layer:** 128 fully connected neurons with ReLU activation.
7. **Dropout Layer:** 50% dropout rate to prevent overfitting on small clinical datasets.
8. **Output Layer:** Single neuron with Sigmoid activation ($p \in [0.0, 1.0]$).

Threshold decision:
- $p \ge 0.50 \implies$ **Tumor Detected** (Confidence $= p \times 100\%$)
- $p < 0.50 \implies$ **No Tumor Detected** (Confidence $= (1 - p) \times 100\%$)

---

## 🛠️ Troubleshooting

| Issue | Resolution |
| :--- | :--- |
| **"brain_tumor_model.keras not found"** | Run `python train.py` first to train and generate the model file, or run the app in Demo mode. |
| **"ModuleNotFoundError: No module named 'tensorflow'"** | Verify virtual environment is active, then run `pip install tensorflow>=2.16.1`. |
| **"Invalid image format error"** | Ensure the file is an uncorrupted image in `.jpg`, `.jpeg`, or `.png` format. |
| **Dataset empty error** | Run `python generate_sample_dataset.py` to create sample images or add images to `dataset/yes` and `dataset/no`. |

---

## ⚠️ Medical Disclaimer

> **IMPORTANT NOTICE:** This application and deep learning model are developed strictly for **educational, academic, and research purposes**. It is **not** a certified medical diagnostic device and must **never** be used as a substitute for professional clinical radiology evaluation or medical advice.
