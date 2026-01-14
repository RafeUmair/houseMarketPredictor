from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
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

# load dataset (for suburb -> distance lookup)
housing_df = pd.read_csv('../ml/data/melbourne_housing.csv')
housing_df['Suburb'] = housing_df['Suburb'].str.lower().str.strip()

suburb_distance_map = (
    housing_df
    .groupby('Suburb')['Distance']
    .mean()
    .to_dict()
)

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
        "YearSold": 2026,
        "YearsSinceSale": 0,
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
    
    return {"predicted_price": predicted_price}



@app.get("/suburbs")
def get_suburbs():
    suburbs = list(suburb_distance_map.keys())
    return {"suburbs": suburbs}
