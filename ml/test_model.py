import pandas as pd
import joblib
import numpy as np

#Load model
model = joblib.load('model/random_forest_model.joblib')
print("Model loaded successfully!")

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
    'Type_t': 0
}])

#Ensure all columns are present
X_columns = model.feature_names_in_
sample_df = sample_df.reindex(columns=X_columns, fill_value=0)

#predict price
predicted_price = model.predict(sample_df)[0]
print(f"Predicted House Price: ${predicted_price:,.2f}")
