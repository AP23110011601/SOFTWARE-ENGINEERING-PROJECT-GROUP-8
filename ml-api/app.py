from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import numpy as np

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# Model state
# ─────────────────────────────────────────────
crop_model   = None
scaler       = None
disease_model   = None
disease_classes = []
USE_FALLBACK_CROP    = False
USE_FALLBACK_DISEASE = False

# ─────────────────────────────────────────────
# LOAD CROP MODEL  (sklearn pickle)
# ─────────────────────────────────────────────
CROP_MODEL_PATH = "crop_model.pkl"
SCALER_PATH     = "scaler.pkl"

if os.path.exists(CROP_MODEL_PATH) and os.path.exists(SCALER_PATH):
    try:
        import pickle
        with open(CROP_MODEL_PATH, "rb") as f:
            crop_model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        print("[OK] Crop ML Models loaded successfully.")
    except Exception as e:
        print("[WARN] Could not load Crop Models (" + str(e)[:80] + "). Using rule-based fallback.")
        USE_FALLBACK_CROP = True
else:
    print("[WARN] Crop model files missing. Using rule-based fallback.")
    USE_FALLBACK_CROP = True

# ─────────────────────────────────────────────
# LOAD DISEASE MODEL  (TensorFlow / Keras)
# ─────────────────────────────────────────────
DISEASE_MODEL_PATH = "disease_model.h5"
CLASS_NAMES_PATH   = "class_names.txt"

if os.path.exists(DISEASE_MODEL_PATH):
    try:
        import tensorflow as tf
        disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)
        if os.path.exists(CLASS_NAMES_PATH):
            with open(CLASS_NAMES_PATH, "r") as f:
                disease_classes = [line.strip() for line in f if line.strip()]
        else:
            disease_classes = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Unknown"]
        print("[OK] Disease ML Model loaded successfully.")
    except Exception as e:
        print("[WARN] Could not load Disease Model (" + str(e)[:80] + "). Using rule-based fallback.")
        USE_FALLBACK_DISEASE = True
        disease_classes = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Unknown"]
else:
    print("[WARN] Disease model file missing. Using rule-based fallback.")
    USE_FALLBACK_DISEASE = True
    disease_classes = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Unknown"]

# ─────────────────────────────────────────────
# FALLBACK CROP LOGIC  (rule-based)
# ─────────────────────────────────────────────
CROP_RULES = [
    # (N_min, N_max, P_min, K_min, temp_min, temp_max, rainfall_min, ph_min, ph_max, crop)
    (80, 200, 40, 40, 20, 35, 200, 5.5, 7.5, "Rice"),
    (60, 120, 45, 45, 15, 28, 60,  6.0, 8.0, "Wheat"),
    (60, 140, 55, 55, 20, 35, 60,  5.5, 7.5, "Maize"),
    (20, 60,  20, 20, 20, 40, 60,  5.5, 7.0, "Cotton"),
    (20, 80,  20, 20, 22, 38, 100, 6.0, 7.5, "Sugarcane"),
    (40, 120, 55, 50, 15, 30, 55,  6.0, 7.5, "Chickpea"),
    (20, 80,  40, 40, 25, 38, 150, 5.5, 7.5, "Banana"),
    (40, 100, 40, 50, 20, 32, 100, 6.0, 7.5, "Mango"),
    (30, 80,  30, 50, 22, 38, 150, 6.0, 7.5, "Coconut"),
    (20, 60,  50, 50, 18, 30, 65,  6.0, 7.5, "Lentil"),
]

def fallback_crop_predict(N, P, K, temperature, humidity, ph, rainfall):
    """Simple rule-based crop recommendation."""
    scores = {}
    for rule in CROP_RULES:
        n_lo, n_hi, p_lo, k_lo, t_lo, t_hi, r_lo, ph_lo, ph_hi, crop = rule
        score = 0
        if n_lo <= N <= n_hi: score += 2
        if P >= p_lo: score += 1
        if K >= k_lo: score += 1
        if t_lo <= temperature <= t_hi: score += 2
        if rainfall >= r_lo: score += 1
        if ph_lo <= ph <= ph_hi: score += 2
        scores[crop] = score

    best = max(scores, key=scores.get)
    return best

# ─────────────────────────────────────────────
# FALLBACK DISEASE LOGIC  (simple hash-based)
# ─────────────────────────────────────────────
CURE_MAP = {
    "Healthy":         "No treatment required. Maintain your current care schedule.",
    "Leaf Blight":     "Spray Mancozeb 75 WP at 2g/litre of water. Remove badly infected leaves and maintain proper field hygiene.",
    "Rust":            "Apply Propiconazole 25% EC at 1ml/litre. Remove and destroy infected leaves immediately.",
    "Powdery Mildew":  "Use Sulfur-based fungicide or Neem oil spray at 5ml/litre. Ensure good air circulation.",
    "Unknown":         "Take a clearer photo in good lighting, or consult a local agricultural extension officer.",
}

def fallback_disease_predict(image_bytes):
    """Simple fallback: cycles through classes deterministically based on image hash."""
    img_hash = sum(image_bytes[:256]) % len(disease_classes)
    class_name = disease_classes[img_hash]
    confidence  = round(0.72 + (img_hash * 0.04), 2)
    cure = CURE_MAP.get(class_name, CURE_MAP["Unknown"])
    return class_name, confidence, cure, True   # True = is_fallback

# ─────────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────────

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "SmartAgri ML Engine API",
        "models_loaded": {
            "crop":    crop_model is not None,
            "disease": disease_model is not None,
        },
        "fallback_mode": {
            "crop":    USE_FALLBACK_CROP,
            "disease": USE_FALLBACK_DISEASE,
        }
    })


@app.route("/predict-crop", methods=["POST"])
def predict_crop():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON body received"}), 400

        N           = float(data.get("N", 0))
        P           = float(data.get("P", 0))
        K           = float(data.get("K", 0))
        temperature = float(data.get("temperature", 0))
        humidity    = float(data.get("humidity", 0))
        ph          = float(data.get("ph", 0))
        rainfall    = float(data.get("rainfall", 0))

        features = [N, P, K, temperature, humidity, ph, rainfall]

        if not USE_FALLBACK_CROP and crop_model and scaler:
            # Use real ML model
            scaled = scaler.transform([features])
            prediction = crop_model.predict(scaled)
            crop_name = str(prediction[0])
            is_fallback = False
        else:
            # Use rule-based fallback
            crop_name   = fallback_crop_predict(N, P, K, temperature, humidity, ph, rainfall)
            is_fallback = True

        return jsonify({
            "success":     True,
            "crop":        crop_name,
            "is_fallback": is_fallback,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/predict-disease", methods=["POST"])
def predict_disease():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded. Use key: 'image'"}), 400

        file        = request.files["image"]
        image_bytes = file.read()

        if not USE_FALLBACK_DISEASE and disease_model is not None:
            # Use real TF model
            from PIL import Image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            image = image.resize((224, 224))
            img_arr = np.array(image) / 255.0
            img_arr = np.expand_dims(img_arr, axis=0)

            preds      = disease_model.predict(img_arr)
            class_idx  = int(np.argmax(preds[0]))
            confidence = float(preds[0][class_idx])
            class_name = disease_classes[class_idx] if class_idx < len(disease_classes) else "Unknown"
            cure       = CURE_MAP.get(class_name, CURE_MAP["Unknown"])
            is_fallback = False
        else:
            class_name, confidence, cure, is_fallback = fallback_disease_predict(image_bytes)

        return jsonify({
            "success":     True,
            "disease":     class_name,
            "confidence":  round(confidence, 3),
            "cure":        cure,
            "is_fallback": is_fallback,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("[START] SmartAgri ML Engine starting on port 5001 ...")
    app.run(host="0.0.0.0", port=5001, debug=False)
