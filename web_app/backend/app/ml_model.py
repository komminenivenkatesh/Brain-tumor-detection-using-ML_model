import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import model_from_json
import os
from app.config import MODEL_DIR, PIXEL_SPACING_CM, SUBTYPE_MODEL_JSON, SUBTYPE_WEIGHTS_H5
import logging

logger = logging.getLogger(__name__)

class TumorDetectionModel:
    def __init__(self):
        self.classification_model = None
        self.segmentation_model = None
        self.subtype_model = None
        self.disease_labels = ['Normal', 'Tumor']
        self.subtype_labels = ['Glioma', 'Meningioma', 'Pituitary']
        self.load_models()
    
    def load_models(self):
        """Load both classification and segmentation models"""
        try:
            logger.info(f"Loading models from {MODEL_DIR}")
            # Load classification model
            classification_json_path = os.path.join(MODEL_DIR, "model.json")
            classification_weights_path = os.path.join(MODEL_DIR, "model_weights.h5")
            
            if os.path.exists(classification_json_path) and os.path.exists(classification_weights_path):
                with open(classification_json_path, 'r') as json_file:
                    loaded_model_json = json_file.read()
                    self.classification_model = model_from_json(
                        loaded_model_json,
                        custom_objects={"Sequential": tf.keras.Sequential}
                    )
                self.classification_model.load_weights(classification_weights_path)
                self.classification_model.make_predict_function()
                logger.info("Classification model loaded successfully")
            
            # Load segmentation model
            segmentation_json_path = os.path.join(MODEL_DIR, "segmented_model.json")
            segmentation_weights_path = os.path.join(MODEL_DIR, "segmented_weights.h5")
            
            if os.path.exists(segmentation_json_path) and os.path.exists(segmentation_weights_path):
                with open(segmentation_json_path, 'r') as json_file:
                    loaded_model_json = json_file.read()
                    self.segmentation_model = model_from_json(
                        loaded_model_json,
                        custom_objects={"Model": tf.keras.Model}
                    )
                self.segmentation_model.load_weights(segmentation_weights_path)
                self.segmentation_model.make_predict_function()
                logger.info("Segmentation model loaded successfully")
            else:
                logger.warning(f"Segmentation model files not found at {segmentation_json_path} or {segmentation_weights_path}")

            subtype_json_path = os.path.join(MODEL_DIR, SUBTYPE_MODEL_JSON)
            subtype_weights_path = os.path.join(MODEL_DIR, SUBTYPE_WEIGHTS_H5)
            logger.info(f"Checking for subtype model at {subtype_json_path}")
            logger.info(f"  - JSON exists: {os.path.exists(subtype_json_path)}")
            logger.info(f"  - Weights exist: {os.path.exists(subtype_weights_path)}")

            if os.path.exists(subtype_json_path) and os.path.exists(subtype_weights_path):
                logger.info("Loading subtype model...")
                with open(subtype_json_path, 'r') as json_file:
                    loaded_model_json = json_file.read()
                self.subtype_model = model_from_json(
                    loaded_model_json,
                    custom_objects={"Sequential": tf.keras.Sequential}
                )
                self.subtype_model.load_weights(subtype_weights_path)
                self.subtype_model.make_predict_function()
                logger.info("✅ Subtype model loaded successfully!")
            else:
                logger.warning(f"⚠️  Subtype model files not found. Subtype classification will be disabled.")
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def preprocess_image(self, image_path: str, target_size: int = 64) -> np.ndarray:
        """Preprocess image for classification"""
        try:
            img = cv2.imread(image_path, 0)  # Read as grayscale
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")
            
            img = cv2.resize(img, (target_size, target_size))
            img_array = np.array(img)
            img_array = img_array.reshape(1, target_size, target_size, 1)
            img_array = (img_array - 127.0) / 127.0  # Normalize
            
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def predict_classification(self, image_path: str) -> dict:
        """Predict if image has tumor or not"""
        if self.classification_model is None:
            raise ValueError("Classification model not loaded")
        
        try:
            img_array = self.preprocess_image(image_path)
            predictions = self.classification_model.predict(img_array, verbose=0)
            
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            label = self.disease_labels[class_idx]
            is_tumor = bool(class_idx == 1)
            
            return {
                "label": label,
                "is_tumor": is_tumor,
                "confidence": confidence,
                "predictions": {
                    "normal": float(predictions[0][0]),
                    "tumor": float(predictions[0][1])
                }
            }
        except Exception as e:
            logger.error(f"Error during classification: {str(e)}")
            raise
    
    def predict_segmentation(self, image_path: str) -> tuple:
        """Generate segmentation mask for tumor region"""
        if self.segmentation_model is None:
            raise ValueError("Segmentation model not loaded")
        
        try:
            img = cv2.imread(image_path, 0)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")
            
            # Resize for segmentation
            img_resized = cv2.resize(img, (64, 64))
            img_array = img_resized.reshape(1, 64, 64, 1)
            img_array = (img_array - 127.0) / 127.0
            
            # Get segmentation prediction
            seg_predictions = self.segmentation_model.predict(img_array, verbose=0)
            segmented_image = seg_predictions[0]
            
            # Resize back to original size
            original_size = (300, 300)
            segmented_resized = cv2.resize(segmented_image, original_size)
            
            return segmented_resized * 255
        except Exception as e:
            logger.error(f"Error during segmentation: {str(e)}")
            raise

    def predict_subtype(self, image_path: str) -> dict:
        """Predict tumor subtype if a subtype model is available."""
        if self.subtype_model is None:
            return {
                "tumor_type": "Tumor",
                "tumor_subtype": None,
                "subtype_confidence": None
            }

        try:
            img_array = self.preprocess_image(image_path)
            predictions = self.subtype_model.predict(img_array, verbose=0)

            class_idx = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][class_idx])
            subtype = self.subtype_labels[class_idx]

            return {
                "tumor_type": subtype,
                "tumor_subtype": subtype,
                "subtype_confidence": confidence
            }
        except Exception as e:
            logger.error(f"Error during subtype prediction: {str(e)}")
            return {
                "tumor_type": "Tumor",
                "tumor_subtype": None,
                "subtype_confidence": None
            }
    
    def analyze_image(self, image_path: str, output_path: str) -> dict:
        """Complete analysis: classification + segmentation if tumor"""
        try:
            logger.info(f"Starting analysis for image: {image_path}")
            
            # Classification
            classification_result = self.predict_classification(image_path)
            logger.info(f"Classification result: {classification_result}")
            
            segmentation_path = None
            tumor_metadata = {
                "tumor_type": "Tumor" if classification_result["is_tumor"] else "Normal",
                "tumor_subtype": None,
                "subtype_confidence": None,
                "tumor_count": 0,
                "tumor_location": "N/A",
                "tumor_size_cm2": 0.0,
                "tumor_area_px": 0
            }
            
            # Segmentation only if tumor detected
            if classification_result['is_tumor']:
                try:
                    logger.info("Tumor detected, running segmentation...")
                    segmented_image = self.predict_segmentation(image_path)
                    # Handle different file extensions (both uppercase and lowercase)
                    base_path = os.path.splitext(output_path)[0]
                    segmented_output_path = f"{base_path}_segmented.png"
                    cv2.imwrite(segmented_output_path, segmented_image)
                    segmentation_path = segmented_output_path
                    tumor_metadata = self._extract_tumor_metadata(segmented_image)
                    logger.info(f"Segmentation completed: {segmentation_path}")
                except Exception as e:
                    logger.warning(f"Segmentation failed: {str(e)}")

                subtype_result = self.predict_subtype(image_path)
                tumor_metadata.update(subtype_result)
            
            classification_result['segmentation_path'] = segmentation_path
            classification_result.update(tumor_metadata)
            logger.info(f"Final analysis result: {classification_result}")
            return classification_result
        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            raise

    def _extract_tumor_metadata(self, segmented_image: np.ndarray) -> dict:
        """Estimate tumor count, location, and size from segmentation mask."""
        mask = (segmented_image > 127).astype(np.uint8)
        if mask.ndim != 2:
            mask = mask.squeeze()

        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
        if num_labels <= 1:
            return {
                "tumor_count": 0,
                "tumor_location": "N/A",
                "tumor_size_cm2": 0.0,
                "tumor_area_px": 0
            }

        component_stats = stats[1:]
        component_centroids = centroids[1:]
        areas = component_stats[:, cv2.CC_STAT_AREA]
        tumor_count = int(len(areas))
        total_area_px = int(np.sum(areas))

        largest_idx = int(np.argmax(areas))
        center_x, center_y = component_centroids[largest_idx]
        height, width = mask.shape

        side = "Left" if center_x < (width / 2) else "Right"
        region = "Frontal" if center_y < (height / 2) else "Occipital"
        tumor_location = f"{side} {region} Lobe"

        tumor_size_cm2 = round(total_area_px * (PIXEL_SPACING_CM ** 2), 2)

        return {
            "tumor_count": tumor_count,
            "tumor_location": tumor_location,
            "tumor_size_cm2": tumor_size_cm2,
            "tumor_area_px": total_area_px
        }

# Global model instance
_tumor_model = None

def get_tumor_model():
    global _tumor_model
    if _tumor_model is None:
        _tumor_model = TumorDetectionModel()
    return _tumor_model

def get_model_status() -> dict:
    """Return model readiness without triggering lazy model load."""
    global _tumor_model

    if _tumor_model is None:
        return {
            "loaded": False,
            "state": "cold",
            "classification_loaded": False,
            "segmentation_loaded": False,
            "subtype_loaded": False,
            "message": "Model not loaded yet. First prediction may take longer."
        }

    classification_loaded = _tumor_model.classification_model is not None
    segmentation_loaded = _tumor_model.segmentation_model is not None
    subtype_loaded = _tumor_model.subtype_model is not None

    if classification_loaded:
        state = "ready"
        message = "Core model is loaded and ready for predictions."
    else:
        state = "error"
        message = "Core classification model failed to load."

    return {
        "loaded": classification_loaded,
        "state": state,
        "classification_loaded": classification_loaded,
        "segmentation_loaded": segmentation_loaded,
        "subtype_loaded": subtype_loaded,
        "message": message
    }
