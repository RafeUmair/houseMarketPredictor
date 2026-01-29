from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import numpy as np
from typing import Optional

#Property class 
class Property(BaseModel):
    Rooms: int
    Bathroom: int
    Car: int
    Landsize: float
    Type_h: int
    Type_u: int
    Type_t: int
    Suburb: str

#Load model
model = joblib.load('../ml/model/random_forest_model.joblib')

#Load model metrics
with open('../ml/model/model_metrics.json', 'r') as f:
    model_metrics = json.load(f)

# load dataset (for suburb -> distance lookup)
housing_df = pd.read_csv('../ml/data/melbourne_housing.csv')
housing_df['Suburb'] = housing_df['Suburb'].str.lower().str.strip()

suburb_distance_map = (
    housing_df
    .groupby('Suburb')['Distance']
    .mean()
    .to_dict()
)

#Load suburb ranges for validation warnings
with open('../ml/data/suburb_ranges.json', 'r') as f:
    suburb_ranges = json.load(f)

app = FastAPI()

#Cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.post("/predictPrice")
def predict_price(property: Property):
    #Convert input to DataFrame

    suburb_key = property.Suburb.lower().strip()
    distance_to_cbd = suburb_distance_map.get(suburb_key)

    data = pd.DataFrame([{
        "Rooms": property.Rooms,
        "Bathroom": property.Bathroom,
        "Car": property.Car,
        "Landsize": property.Landsize,
        "Distance_to_CBD": distance_to_cbd,
        "Type_h": property.Type_h,
        "Type_u": property.Type_u,
        "Type_t": property.Type_t
    }])
    
    #Ensure all columns are present
    X_columns = model.feature_names_in_
    data = data.reindex(columns=X_columns, fill_value=0)

    #Predict price
    predicted_price = model.predict(data)[0]

    #Calculate per-prediction confidence from individual tree predictions
    tree_predictions = np.array([tree.predict(data)[0] for tree in model.estimators_])
    std_dev = np.std(tree_predictions)
    mean_pred = np.mean(tree_predictions)

    #Coefficient of variation (lower = more confident)
    cv = std_dev / mean_pred if mean_pred > 0 else 1

    #Convert to confidence percentage (cv of 0 = 100%, cv of 0.5+ = ~50%)
    confidence_pct = max(0, min(100, (1 - cv * 2) * 100))

    #Calculate price range (±1 std dev covers ~68% of predictions)
    price_low = predicted_price - std_dev
    price_high = predicted_price + std_dev

    return {
        "predicted_price": predicted_price,
        "confidence_pct": round(confidence_pct, 1),
        "price_low": round(price_low, 0),
        "price_high": round(price_high, 0)
    }



@app.get("/suburbs")
def get_suburbs():
    suburbs = list(suburb_distance_map.keys())
    return {"suburbs": suburbs}

@app.get("/model-stats")
def get_model_stats():
    return {
        "accuracy_pct": model_metrics["accuracy_pct"],
        "mape": model_metrics["mape"],
        "training_samples": model_metrics["training_samples"]
    }

@app.get("/suburb-range/{suburb}")
def get_suburb_range(suburb: str):
    suburb_key = suburb.lower().strip()
    if suburb_key in suburb_ranges:
        data = suburb_ranges[suburb_key]
        return {
            "found": True,
            "landsize_min": data["landsize_min"],
            "landsize_max": data["landsize_max"],
            "sample_count": data["count"]
        }
    return {"found": False}
