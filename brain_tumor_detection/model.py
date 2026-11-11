"""
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
    
    Architecture:
      - 3 Convolutional Blocks (Conv2D + BatchNormalization + MaxPooling2D)
      - Feature Flattening
      - Dense Hidden Layer (128 units) with 50% Dropout for regularization
      - Single Sigmoid Output unit for binary probability
    """
    model = models.Sequential([
        # --- Block 1: Low-level features (edges, contours) ---
        layers.Input(shape=input_shape),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same', name='conv1'),
        layers.BatchNormalization(name='bn1'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool1'),

        # --- Block 2: Mid-level features (tissue textures, ventricles) ---
        layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='conv2'),
        layers.BatchNormalization(name='bn2'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool2'),

        # --- Block 3: High-level features (lesion shapes, hyperintensities) ---
        layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='conv3'),
        layers.BatchNormalization(name='bn3'),
        layers.MaxPooling2D(pool_size=(2, 2), name='pool3'),

        # --- Classification Head ---
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
    
    Args:
        image_input: PIL Image object or file path.
        target_size: Tuple (width, height), defaults to (128, 128).
        
    Returns:
        np.ndarray: Normalized batch array of shape (1, 128, 128, 3) in range [0, 1].
    """
    if not isinstance(image_input, Image.Image):
        image = Image.open(image_input)
    else:
        image = image_input

    # Ensure 3-channel RGB representation (converts grayscale and RGBA safely)
    image = image.convert('RGB')
    
    # Resize to exact target dimension
    image = image.resize(target_size, Image.Resampling.BILINEAR)
    
    # Convert to float numpy array and normalize pixel intensities to [0, 1]
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # Expand dims to create batch dimension (1, height, width, channels)
    img_batch = np.expand_dims(img_array, axis=0)
    
    return img_batch


if __name__ == '__main__':
    # Print model summary when run directly
    print("Initializing Brain Tumor CNN architecture...")
    net = create_brain_tumor_cnn()
    net.summary()
