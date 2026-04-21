from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import numpy as np

app = Flask(__name__)
CORS(app, origins=["https://frontend-app.onrender.com"])  # change if needed

# ─────────────────────────────────────────────
# BASE DIRECTORY (IMPORTANT FIX)
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────
# Model state
# ─────────────────────────────────────────────
crop_model = None
scaler = None
disease_model = None
disease_classes = []
USE_FALLBACK_CROP = False
USE_FALLBACK_DISEASE = False

# ─────────────────────────────────────────────
# LOAD CROP MODEL
# ─────────────────────────────────────────────
CROP_MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

if os.path.exists(CROP_MODEL_PATH) and os.path.exists(SCALER_PATH):
    try:
        import pickle
        with open(CROP_MODEL_PATH, "rb") as f:
            crop_model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        print("[OK] Crop ML Models loaded successfully.")
    except Exception as e:
        print(f"[WARN] Crop model load failed: {e}")
        USE_FALLBACK_CROP = True
else:
    print("[WARN] Crop model files missing.")
    USE_FALLBACK_CROP = True

# ─────────────────────────────────────────────
# LOAD DISEASE MODEL
# ─────────────────────────────────────────────
DISEASE_MODEL_PATH = os.path.join(BASE_DIR, "best_disease_model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.txt")
print("Crop path:", CROP_MODEL_PATH, os.path.exists(CROP_MODEL_PATH))
print("Disease path:", DISEASE_MODEL_PATH, os.path.exists(DISEASE_MODEL_PATH))

if os.path.exists(DISEASE_MODEL_PATH):
    try:
        import tensorflow as tf
        disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)

        if os.path.exists(CLASS_NAMES_PATH):
            with open(CLASS_NAMES_PATH, "r") as f:
                disease_classes = [line.strip() for line in f]
        else:
            disease_classes = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Unknown"]

        print("[OK] Disease model loaded.")
    except Exception as e:
        print(f"[WARN] Disease model load failed: {e}")
        USE_FALLBACK_DISEASE = True
else:
    print("[WARN] Disease model missing.")
    USE_FALLBACK_DISEASE = True

# ─────────────────────────────────────────────
# FALLBACK LOGIC
# ─────────────────────────────────────────────
CROP_RULES = [
    (80, 200, 40, 40, 20, 35, 200, 5.5, 7.5, "Rice"),
    (60, 120, 45, 45, 15, 28, 60, 6.0, 8.0, "Wheat"),
    (60, 140, 55, 55, 20, 35, 60, 5.5, 7.5, "Maize"),
]

def fallback_crop_predict(N, P, K, temperature, humidity, ph, rainfall):
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
    return max(scores, key=scores.get)

CURE_MAP = {
    "Healthy": "No treatment required.",
    "Leaf Blight": "Use Mancozeb spray.",
    "Rust": "Use Propiconazole.",
    "Powdery Mildew": "Use Sulfur spray.",
    "Unknown": "Consult expert.",
}

def fallback_disease_predict(image_bytes):
    idx = sum(image_bytes[:256]) % len(disease_classes)
    name = disease_classes[idx]
    return name, 0.75, CURE_MAP.get(name, "Consult expert"), True

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.route("/")
def health():
    return jsonify({
        "status": "online",
        "models_loaded": {
            "crop": crop_model is not None,
            "disease": disease_model is not None
        },
        "fallback_mode": {
            "crop": USE_FALLBACK_CROP,
            "disease": USE_FALLBACK_DISEASE
        }
    })

@app.route("/predict-crop", methods=["POST"])
def predict_crop():
    data = request.json
    N = float(data["N"])
    P = float(data["P"])
    K = float(data["K"])
    temp = float(data["temperature"])
    hum = float(data["humidity"])
    ph = float(data["ph"])
    rain = float(data["rainfall"])

    features = [N, P, K, temp, hum, ph, rain]

    if not USE_FALLBACK_CROP:
        scaled = scaler.transform([features])
        pred = crop_model.predict(scaled)
        return jsonify({"crop": str(pred[0]), "is_fallback": False})

    crop = fallback_crop_predict(N, P, K, temp, hum, ph, rain)
    return jsonify({"crop": crop, "is_fallback": True})

@app.route("/predict-disease", methods=["POST"])
def predict_disease():
    file = request.files["image"]
    img_bytes = file.read()

    if not USE_FALLBACK_DISEASE:
        from PIL import Image
        import tensorflow as tf

        img = Image.open(io.BytesIO(img_bytes)).resize((224, 224))
        arr = np.array(img) / 255.0
        arr = np.expand_dims(arr, axis=0)

        preds = disease_model.predict(arr)
        idx = np.argmax(preds[0])
        name = disease_classes[idx]
        conf = float(preds[0][idx])

        return jsonify({
            "disease": name,
            "confidence": round(conf, 3),
            "is_fallback": False
        })

    name, conf, cure, _ = fallback_disease_predict(img_bytes)
    return jsonify({
        "disease": name,
        "confidence": conf,
        "cure": cure,
        "is_fallback": True
    })

# ─────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
