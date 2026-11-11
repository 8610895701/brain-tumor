"""
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
        print(f"\n[ERROR] Dataset folder '{data_dir}' not found!")
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
        print(f"\n[ERROR] Dataset folder '{data_dir}' is missing required subfolders with images ('yes/' and 'no/').")
        print("Expected structure:")
        print(f"  {data_dir}/")
        print("    ├── yes/  (MRI scans showing tumors)")
        print("    └── no/   (Healthy brain MRI scans)")
        print("\nRun: python generate_sample_dataset.py  to auto-generate sample scans.")
        sys.exit(1)

    yes_count = len(os.listdir(yes_dir))
    no_count = len(os.listdir(no_dir))
    print(f"[DATASET] Found {yes_count} 'yes' (Tumor) scans and {no_count} 'no' (Healthy) scans.")


def load_datasets(data_dir, batch_size=16, img_size=IMG_SIZE):
    """
    Loads images from disk using tf.keras.utils.image_dataset_from_directory
    with 80% train and 20% validation split.
    Normalizes pixel intensities to [0, 1].
    """
    print(f"[DATASET] Loading images from '{data_dir}' with 80/20 train-val split...")

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

    # Class names: 0: 'no' (healthy), 1: 'yes' (tumor)
    print(f"[DATASET] Classes detected: {train_ds.class_names}")

    # Normalization layer (scales [0, 255] to [0, 1.0])
    normalization_layer = tf.keras.layers.Rescaling(1.0 / 255)

    # Simple data augmentation for training robustness
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
    ])

    train_ds = train_ds.map(lambda x, y: (data_augmentation(normalization_layer(x), training=True), y))
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    # Performance optimization: cache and prefetch
    train_ds = train_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)

    return train_ds, val_ds


def main():
    args = parse_arguments()
    print("=" * 60)
    print(" NeuroScan AI - Brain Tumor Detection CNN Training")
    print("=" * 60)
    print(f"Target Image Size : {IMG_SIZE}")
    print(f"Epochs            : {args.epochs}")
    print(f"Batch Size        : {args.batch_size}")
    print(f"Output File       : {args.output_model}")
    print("=" * 60)

    # Step 1: Verify Dataset
    verify_dataset(args.data_dir)

    # Step 2: Load Data
    train_ds, val_ds = load_datasets(args.data_dir, batch_size=args.batch_size, img_size=IMG_SIZE)

    # Step 3: Build CNN Model
    print("\n[MODEL] Compiling CNN Architecture...")
    model = create_brain_tumor_cnn(input_shape=INPUT_SHAPE)
    model.summary()

    # Step 4: Configure Callbacks
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

    # Step 5: Train Model
    print(f"\n[TRAINING] Starting model training for {args.epochs} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks
    )

    # Step 6: Final Evaluation
    print("\n" + "=" * 60)
    print(" Model Training Completed!")
    print("=" * 60)
    eval_results = model.evaluate(val_ds, verbose=0)
    print(f"Validation Loss     : {eval_results[0]:.4f}")
    print(f"Validation Accuracy : {eval_results[1] * 100:.2f}%")
    if len(eval_results) >= 4:
        print(f"Validation Precision: {eval_results[2] * 100:.2f}%")
        print(f"Validation Recall   : {eval_results[3] * 100:.2f}%")

    # If ModelCheckpoint didn't trigger, save final model
    if not os.path.exists(args.output_model):
        model.save(args.output_model)
        print(f"[SAVED] Model saved to {args.output_model}")
    else:
        print(f"[SUCCESS] Best model checkpoint saved to '{args.output_model}'")

    print("\nNext Steps:")
    print("  Run the web app using Streamlit:")
    print("  $ streamlit run app.py")


if __name__ == "__main__":
    main()
