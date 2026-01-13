from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from typing import Optional

#Property class 
class Property(BaseModel):
    Rooms: int
    Distance_to_CBD: float
    Bathroom: int
    Car: int
    Landsize: float
    Type_h: int  #House
    Type_u: int  #Unit
    Type_t: int  #Townhouse

#Load model
model = joblib.load('../ml/model/random_forest_model.joblib')

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
    data = pd.DataFrame([property.dict()])
    
    #Ensure all columns are present
    X_columns = model.feature_names_in_
    data = data.reindex(columns=X_columns, fill_value=0)
    
    #Predict price
    predicted_price = model.predict(data)[0]
    
    return {"predicted_price": predicted_price}