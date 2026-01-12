from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd


#Property class 
class Property(BaseModel):
    Rooms: int
    Distance_to_CBD: float
    Bathroom: int
    Car: int
    Landsize: float
    YearSold: int
    YearsSinceSale: int
    Type_h: int  #House
    Type_u: int  #Unit
    Type_t: int  #Townhouse


#Load model
model = joblib.load('../ml/model/random_forest_model.joblib')

app = FastAPI()


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





