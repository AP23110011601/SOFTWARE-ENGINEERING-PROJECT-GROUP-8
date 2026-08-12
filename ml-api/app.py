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
# PATHS
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


CROP_MODEL_PATH = os.path.join(
    BASE_DIR,
    "crop_model.pkl"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "scaler.pkl"
)


# Supports both formats
KERAS_MODEL = os.path.join(
    BASE_DIR,
    "disease_model.keras"
)

H5_MODEL = os.path.join(
    BASE_DIR,
    "best_disease_model.h5"
)


CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "class_names.txt"
)



# =====================================================
# VARIABLES
# =====================================================

crop_model = None
scaler = None

disease_model = None
disease_classes = []


USE_FALLBACK_CROP = False
USE_FALLBACK_DISEASE = False



print("==============================")
print("MODEL CHECK")
print("==============================")



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


        print(
            "[SUCCESS] Crop model loaded"
        )


    else:

        print(
            "[WARNING] Crop model missing"
        )

        USE_FALLBACK_CROP = True



except Exception:

    print(
        "[ERROR] Crop model failed"
    )

    traceback.print_exc()

    USE_FALLBACK_CROP = True





# =====================================================
# LOAD DISEASE MODEL
# =====================================================

try:

    import keras


    model_path = None


    if os.path.exists(KERAS_MODEL):

        model_path = KERAS_MODEL


    elif os.path.exists(H5_MODEL):

        model_path = H5_MODEL



    if model_path:


        print(
            "Loading disease model:",
            model_path
        )


        disease_model = keras.models.load_model(
            model_path,
            compile=False
        )


        print(
            "[SUCCESS] Disease model loaded"
        )



        if os.path.exists(CLASS_NAMES_PATH):

            with open(
                CLASS_NAMES_PATH,
                "r"
            ) as f:

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

        print(
            "[WARNING] Disease model file missing"
        )

        USE_FALLBACK_DISEASE = True




except Exception as e:


    print(
        "[ERROR] Disease model loading failed"
    )


    print(e)


    traceback.print_exc()


    USE_FALLBACK_DISEASE = True






# =====================================================
# FALLBACK
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




def fallback_disease_predict():

    return (

        "Unknown",
        0.5,
        "Consult agricultural expert"

    )






# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return jsonify({

        "status":"online",

        "models_loaded":{

            "crop":crop_model is not None,

            "disease":disease_model is not None

        },


        "fallback":{

            "crop":USE_FALLBACK_CROP,

            "disease":USE_FALLBACK_DISEASE

        }

    })







# =====================================================
# CROP API
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



        if crop_model and scaler:


            scaled=scaler.transform(
                [features]
            )


            prediction=crop_model.predict(
                scaled
            )


            return jsonify({

                "crop":str(prediction[0]),

                "fallback":False

            })



        return jsonify({

            "crop":fallback_crop_predict(
                *features
            ),

            "fallback":True

        })



    except Exception as e:


        traceback.print_exc()


        return jsonify({

            "error":str(e)

        }),500








# =====================================================
# DISEASE API
# =====================================================


@app.route(
    "/predict-disease",
    methods=["POST"]
)

def predict_disease():


    try:


        file=request.files["image"]


        image=Image.open(
            io.BytesIO(
                file.read()
            )
        )


        image=image.convert(
            "RGB"
        )


        image=image.resize(
            (224,224)
        )



        img=np.array(image)

        img=img/255.0


        img=np.expand_dims(
            img,
            axis=0
        )



        if disease_model:


            result=disease_model.predict(
                img
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
# START
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
