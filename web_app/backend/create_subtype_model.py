"""
Script to create a simple subtype classification model for tumor types.
This creates a basic neural network that classifies tumors as:
- Glioma
- Meningioma
- Pituitary
"""

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import os
import json

# Create output directory
MODEL_DIR = os.path.dirname(__file__)
MODELS_FOLDER = os.path.join(MODEL_DIR, "models")
os.makedirs(MODELS_FOLDER, exist_ok=True)

print("Creating subtype classification model...")

# Define subtype classes
SUBTYPE_CLASSES = ['Glioma', 'Meningioma', 'Pituitary']
NUM_CLASSES = len(SUBTYPE_CLASSES)

# Create a simple CNN model for subtype classification
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 1)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(NUM_CLASSES, activation='softmax')
])

# Compile model
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"Model architecture created for {NUM_CLASSES} tumor types: {SUBTYPE_CLASSES}")

# Create synthetic training data for demonstration
# In production, you would use real labeled tumor images
X_train = np.random.randn(100, 64, 64, 1).astype(np.float32)
y_train = np.random.randint(0, NUM_CLASSES, 100)
y_train_one_hot = tf.keras.utils.to_categorical(y_train, NUM_CLASSES)

print("Training model with synthetic data (demo only)...")
model.fit(X_train, y_train_one_hot, epochs=5, verbose=1)

# Save model as JSON
model_json = model.to_json()
model_json_path = os.path.join(MODELS_FOLDER, "subtype_model.json")
with open(model_json_path, 'w') as json_file:
    json_file.write(model_json)

print(f"✅ Model JSON saved: {model_json_path}")

# Save weights as H5
weights_path = os.path.join(MODELS_FOLDER, "subtype_weights.h5")
model.save_weights(weights_path)

print(f"✅ Model weights saved: {weights_path}")

print("\n" + "="*60)
print("Subtype model created successfully!")
print("="*60)
print(f"Tumor Types: {', '.join(SUBTYPE_CLASSES)}")
print(f"Model files location: {MODELS_FOLDER}")
print(f"- subtype_model.json")
print(f"- subtype_weights.h5")
print("\n⚠️  NOTE: This is a demo model trained on synthetic data.")
print("For production, train on real labeled tumor images.")
print("="*60)
