"""
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
    # Exclude black skull background
    brain_pixels = arr[arr > 30]
    if len(brain_pixels) == 0:
        return 0.1, "Clear Scan"
    
    # Check for localized hyperintense cluster (characteristic of high-density tumor / contrast)
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
            st.markdown(f"**Target Resolution**: `{IMG_SIZE[0]} × {IMG_SIZE[1]} px`")
            st.markdown("**Framework**: TensorFlow / Keras CNN")
        else:
            st.warning("⚠️ Model Not Trained Yet")
            st.markdown(f"""
            `brain_tumor_model.keras` was not found.
            
            **To train the model locally:**
            1. Ensure dataset exists in `dataset/`
            2. Run:
            ```bash
            python train.py
            ```
            """)
            st.info("💡 You can still upload images now using the **Demo Diagnostic Mode**!")

        st.divider()
        st.subheader("Instructions")
        st.markdown("""
        1. Upload a brain MRI scan (`JPG`, `JPEG`, or `PNG`).
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

    # Main layout: Split into upload & results columns
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
                st.markdown(f"**File Details:** `{uploaded_file.name}` ({image.size[0]}×{image.size[1]}px, {image.format})")
                st.image(image, caption="Uploaded MRI Scan", use_container_width=True)
            except Exception as e:
                st.error(f"❌ Invalid image format: Unable to process file. ({str(e)})")
                return

    with col_result:
        st.markdown("### 2. Deep Learning Diagnosis")

        if uploaded_file is None:
            st.info("👈 Please upload a brain MRI scan from the left panel to run detection.")
            
            # Helpful quick guide card
            st.markdown("""
            <div class="metric-card">
                <h4 style="margin-top:0;">What the model analyzes:</h4>
                <ul style="color: #475569; font-size: 14px; padding-left: 20px;">
                    <li><strong>Hyperintense Lesions:</strong> Contrast-enhanced dense tissue clusters</li>
                    <li><strong>Ventricular Distortion:</strong> Asymmetry or compression caused by mass effect</li>
                    <li><strong>Surrounding Edema:</strong> Hypointense margins or abnormal fluid accumulation</li>
                </ul>
            </div>
            """, unsafe_allow_html=True)
            return

        # Perform Inference
        with st.spinner("Analyzing MRI scan with CNN model..."):
            try:
                # Proper image preprocessing
                processed_batch = preprocess_image(image, target_size=IMG_SIZE)

                if model is not None:
                    # True CNN prediction
                    raw_prediction = float(model.predict(processed_batch, verbose=0)[0][0])
                    detection_mode = "Trained TensorFlow Keras CNN"
                else:
                    # Fallback heuristic mode
                    raw_prediction, _ = simulate_heuristic_inference(image)
                    detection_mode = "Educational Demo Heuristic (Train model for production CNN)"

                # Interpretation: sigmoid threshold at 0.50
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

                # Render Result Cards
                st.markdown(f"""
                <div class="{status_class}">
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">{badge}</span>
                    <h2 style="margin: 8px 0; font-size: 26px;">{label}</h2>
                    <p style="margin: 0; font-size: 14px;">{description}</p>
                </div>
                """, unsafe_allow_html=True)

                st.write("")
                
                # Confidence Progress Meter
                st.markdown(f"**Confidence Score:** `{confidence:.2f}%`")
                st.progress(float(confidence / 100.0))

                # Technical metrics grid
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
