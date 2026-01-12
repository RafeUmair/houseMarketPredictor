import joblib
import pandas as pd

#Load model
model = joblib.load('model/random_forest_model.joblib')

#Sample test property
sample = {
    'Rooms': [10],
    'Distance': [20.0],      
    'Bathroom': [2],
    'Car': [10],
    'Landsize': [1000],
    'YearSold': [2020],
    'YearsSinceSale': [6]
}

X_sample = pd.DataFrame(sample)

#predict
predicted_price = model.predict(X_sample)
print(f"Predicted Price: ${predicted_price[0]:,.2f}")
