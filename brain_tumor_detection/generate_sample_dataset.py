"""
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
    """
    Synthesizes a realistic axial brain MRI slice with cranial skull boundary,
    brain parenchyma, bilateral ventricles, and optional hyperintense tumor lesion.
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    size = (256, 256)
    img = Image.new("L", size, color=10)  # Dark background
    draw = ImageDraw.Draw(img)

    # 1. Skull outer contour
    center_x, center_y = 128, 128
    radius_x = random.randint(85, 95)
    radius_y = random.randint(100, 110)
    skull_bbox = [center_x - radius_x, center_y - radius_y, center_x + radius_x, center_y + radius_y]
    draw.ellipse(skull_bbox, fill=45, outline=180, width=4)

    # 2. Brain Parenchyma (Cerebral Cortex)
    brain_bbox = [center_x - radius_x + 8, center_y - radius_y + 8, center_x + radius_x - 8, center_y + radius_y - 8]
    draw.ellipse(brain_bbox, fill=110, outline=90, width=2)

    # Convert to NumPy for anatomical details & noise
    arr = np.array(img, dtype=np.float32)

    # Add realistic MRI rice noise / tissue texture
    noise = np.random.normal(0, 12, size).astype(np.float32)
    mask_brain = arr > 50
    arr[mask_brain] = np.clip(arr[mask_brain] + noise[mask_brain], 40, 220)

    # 3. Lateral Ventricles (Bilateral darker fluid pockets)
    v_width = random.randint(8, 14)
    v_height = random.randint(28, 42)
    # Left ventricle
    lx, ly = 115, 125
    # Right ventricle
    rx, ry = 141, 125
    for y in range(size[1]):
        for x in range(size[0]):
            # Left pocket
            if ((x - lx) ** 2) / (v_width ** 2) + ((y - ly) ** 2) / (v_height ** 2) <= 1:
                arr[y, x] = max(20, arr[y, x] - 70)
            # Right pocket
            if ((x - rx) ** 2) / (v_width ** 2) + ((y - ry) ** 2) / (v_height ** 2) <= 1:
                arr[y, x] = max(20, arr[y, x] - 70)

    # 4. If Tumor: Add hyperintense cranial lesion with subtle edema
    if has_tumor:
        # Choose random quadrant (Frontal, Parietal, or Temporal)
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(25, 55)
        tx = int(center_x + dist * math.cos(angle))
        ty = int(center_y + dist * math.sin(angle))
        tumor_radius = random.randint(14, 26)

        for y in range(max(0, ty - tumor_radius - 12), min(size[1], ty + tumor_radius + 12)):
            for x in range(max(0, tx - tumor_radius - 12), min(size[0], tx + tumor_radius + 12)):
                d = math.sqrt((x - tx) ** 2 + (y - ty) ** 2)
                if d <= tumor_radius:
                    # Hyperintense core
                    intensity_boost = 110 + random.randint(0, 30) - (d / tumor_radius) * 20
                    arr[y, x] = min(255, arr[y, x] + intensity_boost)
                elif d <= tumor_radius + 8:
                    # Surrounding vasogenic edema (halo)
                    arr[y, x] = min(230, arr[y, x] + 35)

    # Clip values and convert back to uint8 PIL Image
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    final_img = Image.fromarray(arr).convert("RGB")
    # Apply subtle smoothing filter like medical scanner reconstruction
    final_img = final_img.filter(ImageFilter.GaussianBlur(radius=0.6))
    return final_img


def generate_dataset(base_dir="dataset", count_per_class=25):
    """Generates synthetic dataset structure: dataset/yes/ and dataset/no/"""
    yes_dir = os.path.join(base_dir, "yes")
    no_dir = os.path.join(base_dir, "no")

    os.makedirs(yes_dir, exist_ok=True)
    os.makedirs(no_dir, exist_ok=True)

    print(f"Generating starter dataset in '{base_dir}'...")

    for i in range(count_per_class):
        # Generate Tumor (yes) scan
        tumor_img = create_brain_slice(has_tumor=True, seed=1000 + i)
        tumor_img.save(os.path.join(yes_dir, f"tumor_mri_{i+1:03d}.jpg"), quality=95)

        # Generate Healthy (no) scan
        healthy_img = create_brain_slice(has_tumor=False, seed=2000 + i)
        healthy_img.save(os.path.join(no_dir, f"healthy_mri_{i+1:03d}.jpg"), quality=95)

    print(f"✅ Generated {count_per_class} 'yes' (Tumor) scans in: {yes_dir}")
    print(f"✅ Generated {count_per_class} 'no' (Healthy) scans in: {no_dir}")
    print("Ready to train! Run: python train.py")


if __name__ == "__main__":
    generate_dataset()
