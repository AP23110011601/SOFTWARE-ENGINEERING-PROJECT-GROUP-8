from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import io
import traceback
import numpy as np
import joblib

from PIL import Image


app = Flask(__name__)

CORS(app)


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# =====================================================
# MODEL VARIABLES
# =====================================================

crop_model = None
scaler = None

disease_model = None
disease_classes = []

USE_FALLBACK_CROP = False
USE_FALLBACK_DISEASE = False



# =====================================================
# MODEL PATHS
# =====================================================

CROP_MODEL_PATH = os.path.join(
    BASE_DIR,
    "crop_model.pkl"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "scaler.pkl"
)

DISEASE_MODEL_PATH = os.path.join(
    BASE_DIR,
    "best_disease_model.h5"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "class_names.txt"
)



print("\n==============================")
print("MODEL FILE CHECK")
print("==============================")

print("Crop Model:",
      CROP_MODEL_PATH,
      os.path.exists(CROP_MODEL_PATH))

print("Scaler:",
      SCALER_PATH,
      os.path.exists(SCALER_PATH))

print("Disease Model:",
      DISEASE_MODEL_PATH,
      os.path.exists(DISEASE_MODEL_PATH))

print("Classes:",
      CLASS_NAMES_PATH,
      os.path.exists(CLASS_NAMES_PATH))



# =====================================================
# LOAD CROP MODEL
# =====================================================

try:

    if os.path.exists(CROP_MODEL_PATH) and os.path.exists(SCALER_PATH):

        crop_model = joblib.load(
            CROP_MODEL_PATH
        )

        scaler = joblib.load(
            SCALER_PATH
        )

        print("[SUCCESS] Crop model loaded")

    else:

        print("[WARNING] Crop model files missing")
        USE_FALLBACK_CROP = True


except Exception:

    print("[ERROR] Crop model loading failed")
    traceback.print_exc()

    USE_FALLBACK_CROP = True




# =====================================================
# LOAD DISEASE MODEL
# =====================================================

try:

    if os.path.exists(DISEASE_MODEL_PATH):

        import tensorflow as tf


        disease_model = tf.keras.models.load_model(
            DISEASE_MODEL_PATH,
            compile=False,
            safe_mode=False
        )


        print("[SUCCESS] Disease model loaded")


        if os.path.exists(CLASS_NAMES_PATH):

            with open(CLASS_NAMES_PATH, "r") as f:

                disease_classes = [
                    x.strip()
                    for x in f.readlines()
                ]

        else:

            disease_classes = [
                "Healthy",
                "Leaf Blight",
                "Rust",
                "Powdery Mildew",
                "Unknown"
            ]


    else:

        print("[WARNING] Disease model missing")
        USE_FALLBACK_DISEASE = True



except Exception:

    print("[ERROR] Disease model loading failed")
    traceback.print_exc()

    USE_FALLBACK_DISEASE = True





# =====================================================
# FALLBACK CROP
# =====================================================

def fallback_crop_predict(
        N,
        P,
        K,
        temperature,
        humidity,
        ph,
        rainfall):


    if rainfall > 150:
        return "Rice"

    elif temperature < 25:
        return "Wheat"

    else:
        return "Maize"




# =====================================================
# FALLBACK DISEASE
# =====================================================

def fallback_disease_predict():

    return (
        "Unknown",
        0.5,
        "Consult agricultural expert"
    )





# =====================================================
# HOME API
# =====================================================

@app.route("/")
def home():

    return jsonify({

        "status":"online",

        "models_loaded":{

            "crop": crop_model is not None,

            "disease": disease_model is not None

        },

        "fallback":{

            "crop":USE_FALLBACK_CROP,

            "disease":USE_FALLBACK_DISEASE

        }

    })





# =====================================================
# CROP PREDICTION
# =====================================================

@app.route(
    "/predict-crop",
    methods=["POST"]
)

def predict_crop():

    try:

        data=request.json


        features=[

            float(data["N"]),
            float(data["P"]),
            float(data["K"]),
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"])

        ]


        if crop_model is not None and scaler is not None:


            scaled = scaler.transform(
                [features]
            )


            prediction = crop_model.predict(
                scaled
            )


            return jsonify({

                "crop":str(prediction[0]),

                "fallback":False

            })



        crop = fallback_crop_predict(
            *features
        )


        return jsonify({

            "crop":crop,

            "fallback":True

        })



    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "error":str(e)

        }),500






# =====================================================
# DISEASE PREDICTION
# =====================================================

@app.route(
    "/predict-disease",
    methods=["POST"]
)

def predict_disease():

    try:


        file=request.files["image"]

        image_bytes=file.read()



        if disease_model is not None:


            img = Image.open(
                io.BytesIO(image_bytes)
            )


            img = img.convert(
                "RGB"
            )


            img = img.resize(
                (224,224)
            )


            img_array=np.array(img)

            img_array=img_array / 255.0


            img_array=np.expand_dims(
                img_array,
                axis=0
            )


            result=disease_model.predict(
                img_array
            )


            index=int(
                np.argmax(result[0])
            )


            disease=disease_classes[index]


            confidence=float(
                result[0][index]
            )



            return jsonify({

                "disease":disease,

                "confidence":round(
                    confidence,
                    3
                ),

                "fallback":False

            })




        disease,confidence,cure = fallback_disease_predict()


        return jsonify({

            "disease":disease,

            "confidence":confidence,

            "cure":cure,

            "fallback":True

        })



    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "error":str(e)

        }),500





# =====================================================
# RUN
# =====================================================

if __name__=="__main__":

    port=int(
        os.environ.get(
            "PORT",
            10000
        )
    )


    app.run(
        host="0.0.0.0",
        port=port
    )
