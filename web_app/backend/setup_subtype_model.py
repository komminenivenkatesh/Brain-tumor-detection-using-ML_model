#!/usr/bin/env python3
"""
Utility to create subtype model weights from scratch.
This creates a dummy/demo subtype classifier for Glioma/Meningioma/Pituitary.
For production, train on real labeled tumor images.
"""

import os
import sys

# Make sure we're using the venv TensorFlow
import subprocess

print("Installing/updating TensorFlow if needed...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "tensorflow"])

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import numpy as np

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(os.path.dirname(script_dir), "models")
subtype_json = os.path.join(models_dir, "subtype_model.json")
subtype_h5 = os.path.join(models_dir, "subtype_weights.h5")

print(f"Models directory: {models_dir}")
print(f"JSON path: {subtype_json}")
print(f"H5 path: {subtype_h5}")

try:
    # Load the JSON architecture
    with open(subtype_json, 'r') as f:
        import json
        model_json = json.load(f)
    
    # Create model from JSON
    model = tf.keras.models.model_from_json(json.dumps(model_json))
    print("✅ Model architecture loaded from JSON")
    
    # Build with dummy data to initialize weights
    dummy_input = np.random.randn(1, 64, 64, 1).astype(np.float32)
    _ = model.predict(dummy_input, verbose=0)
    print("✅ Model built with dummy input")
    
    # Save weights
    model.save_weights(subtype_h5)
    print(f"✅ Weights saved to {subtype_h5}")
    
    print("\n" + "="*60)
    print("✅ Subtype model created successfully!")
    print("="*60)
    print("Tumor Types: Glioma, Meningioma, Pituitary")
    print(f"Files created:")
    print(f"  - {subtype_json}")
    print(f"  - {subtype_h5}")
    print("\n⚠️  NOTE: This is a demo model with random weights.")
    print("For accurate predictions, train on real labeled tumor images.")
    print("="*60)

except Exception as e:
    print(f"❌ Error creating subtype model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
