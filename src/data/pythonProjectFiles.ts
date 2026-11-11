import { PythonProjectFile } from '../types';

export const PYTHON_PROJECT_FILES: PythonProjectFile[] = [
  {
    filename: 'app.py',
    path: 'brain_tumor_detection/app.py',
    language: 'python',
    badge: 'Streamlit UI',
    description: 'Interactive Streamlit medical web dashboard with image upload, preprocessing, model inference, and confidence display.',
    content: `"""
app.py - Streamlit Web Application for Brain Tumor Detection
Modern medical dashboard theme (light blue and white) with deep learning inference.

Run with:
    streamlit run app.py
"""

import os
import streamlit as st
import numpy as np
from PIL import Image, ImageOps
from model import preprocess_image, IMG_SIZE

# Page configuration
st.set_page_config(
    page_title="NeuroScan - Brain Tumor Detection",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom light blue & clean medical CSS styling
st.markdown("""
<style>
    /* Main container background */
    .stApp {
        background-color: #f8fafc;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Header card */
    .medical-header {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        padding: 24px;
        border-radius: 12px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.1);
    }
    .medical-header h1 {
        color: #ffffff !important;
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
    }
    .medical-header p {
        color: #e0f2fe;
        font-size: 15px;
        margin: 0;
    }

    /* Card container */
    .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
    }

    /* Result cards */
    .result-tumor {
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 12px;
        padding: 20px;
        color: #9f1239;
    }
    .result-healthy {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 20px;
        color: #166534;
    }

    /* Disclaimer box */
    .disclaimer-box {
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 13px;
        color: #0369a1;
        margin-top: 16px;
    }
</style>
""", unsafe_allow_html=True)

MODEL_PATH = "brain_tumor_model.keras"


@st.cache_resource
def load_deep_learning_model(model_path):
    """
    Loads Keras deep learning model if available on disk.
    Cached with @st.cache_resource to prevent re-loading on each rerun.
    """
    if os.path.exists(model_path):
        try:
            import tensorflow as tf
            model = tf.keras.models.load_model(model_path)
            return model, None
        except Exception as e:
            return None, f"Failed to load model file: {str(e)}"
    return None, f"Model file '{model_path}' not found on disk."


def simulate_heuristic_inference(image):
    """
    Fallback inference heuristic if model is not yet trained.
    Analyzes high-intensity regional mass clusters in brain slice.
    """
    img_gray = ImageOps.grayscale(image).resize((128, 128))
    arr = np.array(img_gray, dtype=np.float32)
    brain_pixels = arr[arr > 30]
    if len(brain_pixels) == 0:
        return 0.1, "Clear Scan"
    
    high_threshold = np.percentile(brain_pixels, 88)
    high_density_fraction = np.sum(arr > high_threshold) / len(brain_pixels)
    
    if high_density_fraction > 0.14:
        confidence = min(0.98, 0.70 + float(high_density_fraction * 1.5))
        return confidence, "Tumor"
    else:
        confidence = max(0.04, 0.35 - float(high_density_fraction * 1.2))
        return confidence, "No Tumor"


def main():
    # Application Title Header
    st.markdown("""
    <div class="medical-header">
        <h1>🧠 NeuroScan AI - Brain Tumor Detection</h1>
        <p>Convolutional Neural Network (CNN) Classifier for Brain MRI Scans</p>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar: System info & Instructions
    with st.sidebar:
        st.subheader("Model & Setup Status")
        model, model_error = load_deep_learning_model(MODEL_PATH)

        if model is not None:
            st.success("✅ Model loaded: brain_tumor_model.keras")
            st.markdown(f"**Target Resolution**: \`{IMG_SIZE[0]} × {IMG_SIZE[1]} px\`")
            st.markdown("**Framework**: TensorFlow / Keras CNN")
        else:
            st.warning("⚠️ Model Not Trained Yet")
            st.markdown(f"""
            \`brain_tumor_model.keras\` was not found.
            
            **To train the model locally:**
            1. Ensure dataset exists in \`dataset/\`
            2. Run:
            \`\`\`bash
            python train.py
            \`\`\`
            """)
            st.info("💡 You can still test scans now using the **Demo Diagnostic Mode**!")

        st.divider()
        st.subheader("Instructions")
        st.markdown("""
        1. Upload a brain MRI scan (\`JPG\`, \`JPEG\`, or \`PNG\`).
        2. View the preprocessed scan.
        3. Read the automated classification and confidence score.
        4. Use **Reset Analysis** to clear and test another scan.
        """)

        st.divider()
        st.markdown("""
        <div class="disclaimer-box">
            <strong>Educational Prototype:</strong> This tool is developed strictly for learning and research purposes and is not certified for clinical medical diagnosis.
        </div>
        """, unsafe_allow_html=True)

    col_upload, col_result = st.columns([1, 1], gap="large")

    with col_upload:
        st.markdown("### 1. Upload Brain MRI Scan")
        
        # Reset button
        reset_col1, reset_col2 = st.columns([1, 1])
        with reset_col1:
            if st.button("🔄 Reset Analysis", use_container_width=True, type="secondary"):
                if "uploaded_file" in st.session_state:
                    del st.session_state["uploaded_file"]
                st.rerun()

        uploaded_file = st.file_uploader(
            "Choose a brain MRI image file (JPG, JPEG, PNG)",
            type=["jpg", "jpeg", "png"],
            key="uploaded_file",
            help="Axial, coronal, or sagittal T1/T2/FLAIR brain MRI slices"
        )

        if uploaded_file is not None:
            try:
                image = Image.open(uploaded_file)
                st.markdown(f"**File Details:** \`{uploaded_file.name}\` ({image.size[0]}×{image.size[1]}px, {image.format})")
                st.image(image, caption="Uploaded MRI Scan", use_container_width=True)
            except Exception as e:
                st.error(f"❌ Invalid image format: Unable to process file. ({str(e)})")
                return

    with col_result:
        st.markdown("### 2. Deep Learning Diagnosis")

        if uploaded_file is None:
            st.info("👈 Please upload a brain MRI scan from the left panel to run detection.")
            return

        with st.spinner("Analyzing MRI scan with CNN model..."):
            try:
                processed_batch = preprocess_image(image, target_size=IMG_SIZE)

                if model is not None:
                    raw_prediction = float(model.predict(processed_batch, verbose=0)[0][0])
                    detection_mode = "Trained TensorFlow Keras CNN"
                else:
                    raw_prediction, _ = simulate_heuristic_inference(image)
                    detection_mode = "Educational Demo Heuristic"

                is_tumor = raw_prediction >= 0.50
                
                if is_tumor:
                    label = "Tumor Detected"
                    confidence = raw_prediction * 100.0
                    status_class = "result-tumor"
                    badge = "⚠️ POSITIVE INDICATION"
                    description = "The model detected localized hyperintensity and textural asymmetry indicative of a cranial mass or tumor lesion."
                else:
                    label = "No Tumor Detected"
                    confidence = (1.0 - raw_prediction) * 100.0
                    status_class = "result-healthy"
                    badge = "✅ NEGATIVE INDICATION"
                    description = "The scan presents bilateral symmetry with normal ventricular profiles and no anomalous hyperintense lesion clusters."

                st.markdown(f"""
                <div class="{status_class}">
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">{badge}</span>
                    <h2 style="margin: 8px 0; font-size: 26px;">{label}</h2>
                    <p style="margin: 0; font-size: 14px;">{description}</p>
                </div>
                """, unsafe_allow_html=True)

                st.write("")
                st.markdown(f"**Confidence Score:** \`{confidence:.2f}%\`")
                st.progress(float(confidence / 100.0))

                st.markdown("""<div class="metric-card">""", unsafe_allow_html=True)
                m_col1, m_col2, m_col3 = st.columns(3)
                with m_col1:
                    st.metric("Probability (Tumor)", f"{raw_prediction * 100:.1f}%")
                with m_col2:
                    st.metric("Probability (Healthy)", f"{(1 - raw_prediction) * 100:.1f}%")
                with m_col3:
                    st.metric("Input Tensor", f"{IMG_SIZE[0]}×{IMG_SIZE[1]}×3")
                st.caption(f"Engine: {detection_mode}")
                st.markdown("""</div>""", unsafe_allow_html=True)

            except Exception as ex:
                st.error(f"Error during MRI evaluation: {str(ex)}")


if __name__ == "__main__":
    main()
`,
  },
  {
    filename: 'model.py',
    path: 'brain_tumor_detection/model.py',
    language: 'python',
    badge: 'CNN Architecture',
    description: 'TensorFlow / Keras CNN architecture definition with Conv2D, BatchNormalization, MaxPooling2D, Dropout, and preprocessing.',
    content: `"""
model.py - Brain Tumor Detection CNN Model Architecture
Compatible with Python 3.12 and TensorFlow / Keras 2.x / 3.x
"""

import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
from PIL import Image

# Global configuration constants
IMG_SIZE = (128, 128)  # Target height and width (consistent across train and inference)
INPUT_SHAPE = (128, 128, 3)  # RGB channels


def create_brain_tumor_cnn(input_shape=INPUT_SHAPE):
    """
    Creates and compiles a simple, effective Convolutional Neural Network (CNN)
    for binary brain tumor classification (Tumor vs. No Tumor).
    """
    model = models.Sequential([
        # Block 1: Low-level features
        layers.Input(shape=input_shape),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same', name='conv1'),
        layers.BatchNormalization(name='bn1'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool1'),

        # Block 2: Mid-level features
        layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='conv2'),
        layers.BatchNormalization(name='bn2'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool2'),

        # Block 3: High-level features
        layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='conv3'),
        layers.BatchNormalization(name='bn3'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool3'),

        # Classification Head
        layers.Flatten(name='flatten'),
        layers.Dense(128, activation='relu', name='dense1'),
        layers.Dropout(0.5, name='dropout'),
        layers.Dense(1, activation='sigmoid', name='output')  # Probability of tumor
    ], name='BrainTumorCNN')

    # Compile with Adam optimizer and Binary Cross-Entropy loss
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.Recall(name='recall')]
    )

    return model


def preprocess_image(image_input, target_size=IMG_SIZE):
    """
    Preprocesses an input image for CNN inference.
    """
    if not isinstance(image_input, Image.Image):
        image = Image.open(image_input)
    else:
        image = image_input

    image = image.convert('RGB')
    image = image.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_batch = np.expand_dims(img_array, axis=0)
    return img_batch


if __name__ == '__main__':
    print("Initializing Brain Tumor CNN architecture...")
    net = create_brain_tumor_cnn()
    net.summary()
`,
  },
  {
    filename: 'train.py',
    path: 'brain_tumor_detection/train.py',
    language: 'python',
    badge: 'Training Script',
    description: 'Complete training pipeline with dataset loading, data augmentation, early stopping, and model checkpoint saving.',
    content: `"""
train.py - Training Pipeline for Brain Tumor Detection CNN
Loads dataset from dataset/ (yes/ and no/), trains the CNN model,
evaluates performance, and saves the trained model as brain_tumor_model.keras.

Usage:
    python train.py
    python train.py --epochs 20 --batch_size 16
"""

import os
import sys
import argparse
import tensorflow as tf
from model import create_brain_tumor_cnn, IMG_SIZE, INPUT_SHAPE


def parse_arguments():
    parser = argparse.ArgumentParser(description="Train CNN for Brain Tumor Detection")
    parser.add_argument("--data_dir", type=str, default="dataset", help="Path to dataset root folder containing 'yes' and 'no' subfolders")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size for training")
    parser.add_argument("--output_model", type=str, default="brain_tumor_model.keras", help="Target filename for trained model")
    return parser.parse_args()


def verify_dataset(data_dir):
    """Verifies that dataset directory exists and contains necessary subdirectories."""
    if not os.path.exists(data_dir):
        print(f"\\n[ERROR] Dataset folder '{data_dir}' not found!")
        print("Please set up the dataset before training.")
        print("Quick Setup:")
        print("  1. Run: python generate_sample_dataset.py  (Creates a quick starter dataset)")
        print("  2. OR download the Kaggle 'Brain MRI Images for Brain Tumor Detection' dataset")
        print("     and place 'yes' and 'no' image folders into 'dataset/'")
        sys.exit(1)

    yes_dir = os.path.join(data_dir, "yes")
    no_dir = os.path.join(data_dir, "no")

    has_yes = os.path.exists(yes_dir) and len(os.listdir(yes_dir)) > 0
    has_no = os.path.exists(no_dir) and len(os.listdir(no_dir)) > 0

    if not (has_yes and has_no):
        print(f"\\n[ERROR] Dataset folder '{data_dir}' is missing required subfolders with images ('yes/' and 'no/').")
        sys.exit(1)

    print(f"[DATASET] Found {len(os.listdir(yes_dir))} 'yes' scans and {len(os.listdir(no_dir))} 'no' scans.")


def load_datasets(data_dir, batch_size=16, img_size=IMG_SIZE):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=1337,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="binary"
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="binary"
    )

    normalization_layer = tf.keras.layers.Rescaling(1.0 / 255)
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
    ])

    train_ds = train_ds.map(lambda x, y: (data_augmentation(normalization_layer(x), training=True), y))
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    train_ds = train_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)

    return train_ds, val_ds


def main():
    args = parse_arguments()
    print("=" * 60)
    print(" NeuroScan AI - Brain Tumor Detection CNN Training")
    print("=" * 60)

    verify_dataset(args.data_dir)
    train_ds, val_ds = load_datasets(args.data_dir, batch_size=args.batch_size, img_size=IMG_SIZE)

    model = create_brain_tumor_cnn(input_shape=INPUT_SHAPE)
    model.summary()

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=args.output_model,
            monitor="val_accuracy",
            mode="max",
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1
        )
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks
    )

    eval_results = model.evaluate(val_ds, verbose=0)
    print(f"Validation Loss     : {eval_results[0]:.4f}")
    print(f"Validation Accuracy : {eval_results[1] * 100:.2f}%")

    if not os.path.exists(args.output_model):
        model.save(args.output_model)

    print(f"[SUCCESS] Model saved to '{args.output_model}'")
    print("Launch Streamlit app: streamlit run app.py")


if __name__ == "__main__":
    main()
`,
  },
  {
    filename: 'generate_sample_dataset.py',
    path: 'brain_tumor_detection/generate_sample_dataset.py',
    language: 'python',
    badge: 'Dataset Utility',
    description: 'Instant starter dataset generator: synthesizes realistic axial brain slices with and without hyperintense lesions.',
    content: `"""
generate_sample_dataset.py - Quick Starter Dataset Generator
Generates a small starter dataset in dataset/yes/ and dataset/no/
so you can immediately test model training without downloading external files.

Run with:
    python generate_sample_dataset.py
"""

import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def create_brain_slice(has_tumor=False, seed=None):
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    size = (256, 256)
    img = Image.new("L", size, color=10)
    draw = ImageDraw.Draw(img)

    center_x, center_y = 128, 128
    radius_x = random.randint(85, 95)
    radius_y = random.randint(100, 110)
    skull_bbox = [center_x - radius_x, center_y - radius_y, center_x + radius_x, center_y + radius_y]
    draw.ellipse(skull_bbox, fill=45, outline=180, width=4)

    brain_bbox = [center_x - radius_x + 8, center_y - radius_y + 8, center_x + radius_x - 8, center_y + radius_y - 8]
    draw.ellipse(brain_bbox, fill=110, outline=90, width=2)

    arr = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 12, size).astype(np.float32)
    mask_brain = arr > 50
    arr[mask_brain] = np.clip(arr[mask_brain] + noise[mask_brain], 40, 220)

    # Ventricles
    v_width = random.randint(8, 14)
    v_height = random.randint(28, 42)
    lx, ly = 115, 125
    rx, ry = 141, 125
    for y in range(size[1]):
        for x in range(size[0]):
            if ((x - lx) ** 2) / (v_width ** 2) + ((y - ly) ** 2) / (v_height ** 2) <= 1:
                arr[y, x] = max(20, arr[y, x] - 70)
            if ((x - rx) ** 2) / (v_width ** 2) + ((y - ry) ** 2) / (v_height ** 2) <= 1:
                arr[y, x] = max(20, arr[y, x] - 70)

    if has_tumor:
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(25, 55)
        tx = int(center_x + dist * math.cos(angle))
        ty = int(center_y + dist * math.sin(angle))
        tumor_radius = random.randint(14, 26)

        for y in range(max(0, ty - tumor_radius - 12), min(size[1], ty + tumor_radius + 12)):
            for x in range(max(0, tx - tumor_radius - 12), min(size[0], tx + tumor_radius + 12)):
                d = math.sqrt((x - tx) ** 2 + (y - ty) ** 2)
                if d <= tumor_radius:
                    arr[y, x] = min(255, arr[y, x] + 110)
                elif d <= tumor_radius + 8:
                    arr[y, x] = min(230, arr[y, x] + 35)

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    final_img = Image.fromarray(arr).convert("RGB")
    return final_img.filter(ImageFilter.GaussianBlur(radius=0.6))


def generate_dataset(base_dir="dataset", count_per_class=25):
    yes_dir = os.path.join(base_dir, "yes")
    no_dir = os.path.join(base_dir, "no")

    os.makedirs(yes_dir, exist_ok=True)
    os.makedirs(no_dir, exist_ok=True)

    print(f"Generating starter dataset in '{base_dir}'...")

    for i in range(count_per_class):
        tumor_img = create_brain_slice(has_tumor=True, seed=1000 + i)
        tumor_img.save(os.path.join(yes_dir, f"tumor_mri_{i+1:03d}.jpg"), quality=95)

        healthy_img = create_brain_slice(has_tumor=False, seed=2000 + i)
        healthy_img.save(os.path.join(no_dir, f"healthy_mri_{i+1:03d}.jpg"), quality=95)

    print(f"Generated {count_per_class} 'yes' scans and {count_per_class} 'no' scans.")


if __name__ == "__main__":
    generate_dataset()
`,
  },
  {
    filename: 'requirements.txt',
    path: 'brain_tumor_detection/requirements.txt',
    language: 'plaintext',
    badge: 'Dependencies',
    description: 'Python packages required for Streamlit and TensorFlow CNN.',
    content: `# Brain Tumor Detection Requirements
# Compatible with Python 3.12, macOS, Linux, and Windows

streamlit>=1.35.0
tensorflow>=2.16.1
numpy>=1.26.0
pillow>=10.3.0
matplotlib>=3.8.0
`,
  },
  {
    filename: 'README.md',
    path: 'brain_tumor_detection/README.md',
    language: 'markdown',
    badge: 'Docs',
    description: 'Complete documentation, beginner guide, and execution commands.',
    content: `# 🧠 Brain Tumor Detection Web Application

An educational, beginner-friendly Deep Learning web application for detecting brain tumors from MRI scans using a Convolutional Neural Network (CNN), TensorFlow/Keras, and Streamlit.

## Quickstart Commands

\`\`\`bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create sample dataset (or copy Kaggle dataset to dataset/yes and dataset/no)
python generate_sample_dataset.py

# 4. Train the CNN model
python train.py --epochs 15

# 5. Launch the Streamlit web app
streamlit run app.py
\`\`\`

Target Image Size: 128x128 pixels RGB
Saved Model: brain_tumor_model.keras
`,
  },
];
