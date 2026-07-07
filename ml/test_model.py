import pandas as pd
import joblib
import numpy as np
import json

#Load model
model = joblib.load('model/random_forest_model.joblib')
print("Model loaded successfully!")

#Load suburb price index for a realistic Suburb_Price_Index value
with open('model/suburb_price_index.json') as f:
    suburb_price_index = json.load(f)
sample_suburb = 'reservoir'
suburb_price_level = suburb_price_index['suburbs'].get(sample_suburb, suburb_price_index['global_mean'])

#Sample test property
sample_df = pd.DataFrame([{
    'Rooms': 4,
    'Distance_to_CBD': 28.5,
    'Bathroom': 2,
    'Car': 2,
    'Landsize': 600,
    'YearSold': 2025,
    'YearsSinceSale': 1,
    'Type_h': 0,
    'Type_u': 1,
    'Type_t': 0,
    'Suburb_Price_Index': suburb_price_level
}])

#Ensure all columns are present
X_columns = model.feature_names_in_
sample_df = sample_df.reindex(columns=X_columns, fill_value=0)

#predict price
predicted_price = model.predict(sample_df)[0]
print(f"Predicted House Price: ${predicted_price:,.2f}")
