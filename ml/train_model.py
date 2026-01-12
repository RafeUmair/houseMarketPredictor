import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib

#load dataset
df = pd.read_csv('data/melbourne_housing.csv')

#Drop missing values
df = df.dropna()

#Convert date to datetime
df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)

#Convert price to float
df['Price'] = df['Price'].astype(float)

#Get year sold and years since sale
current_year = 2026
df['YearSold'] = df['Date'].dt.year
df['YearsSinceSale'] = current_year - df['YearSold']

#Annual growth rate adjustment
annual_growth_rate = 0.065

#Calculate todays adjusted price
df['Price_Adjusted'] = df['Price'] * ((1 + annual_growth_rate) ** df['YearsSinceSale'])

#Define input and output sets
feature_columns = ['Rooms', 'Distance', 'Bathroom', 'Car', 'Landsize', 'YearSold', 'YearsSinceSale']
X = df[feature_columns]
y = df['Price_Adjusted']


#Split the training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)



#evaluate the model
y_pred = model.predict(X_test)
rmse = mean_squared_error(y_test, y_pred)
print(f"Test RMSE: {rmse:.2f}")



#Save the model
joblib.dump(model, 'model/random_forest_model.joblib')
print("Model saved to /model/random_forest_model.joblib")

    