import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_percentage_error
import joblib
import numpy as np
import json

#load dataset
df = pd.read_csv('data/melbourne_housing.csv')

#Impute missing or zero landsize for units and townhouses, based on average sizes by number of rooms
def impute_landsize(row):
    landsize = row['Landsize']
    # Check for missing OR zero landsize
    if pd.isna(landsize) or landsize == 0:
        if row['Type'] == 'u':
            rooms = row['Rooms']
            if rooms == 1:
                return 50
            elif rooms == 2:
                return 80
            elif rooms == 3:
                return 110
            else:
                return 130
        elif row['Type'] == 't':
            rooms = row['Rooms']
            if rooms == 1:
                return 120
            elif rooms == 2:
                return 180
            elif rooms == 3:
                return 220
            else:
                return 280
    return landsize

df['Landsize'] = df.apply(impute_landsize, axis=1)

# Drop remaining missing values
df = df.dropna()

# Remove outliers that skew the model
# Remove properties with unrealistic landsize (likely data errors)
df = df[(df['Landsize'] > 0) & (df['Landsize'] < 10000)]

#Remove extreme price outliers (top/bottom 1%)
price_lower = df['Price'].quantile(0.01)
price_upper = df['Price'].quantile(0.99)
df = df[(df['Price'] >= price_lower) & (df['Price'] <= price_upper)]

print(f"Training on {len(df)} properties after cleaning")

#convert date to datetime
df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)

#convert price to float
df['Price'] = df['Price'].astype(float)

#year sold and years since sale
current_year = 2026
df['YearSold'] = df['Date'].dt.year
df['YearsSinceSale'] = current_year - df['YearSold']

#annual growth rate adjustment
annual_growth_rate = 0.065

#calculate adjusted price
df['Price_Adjusted'] = df['Price'] * ((1 + annual_growth_rate) ** df['YearsSinceSale'])

#distance to cbd
df['Distance_to_CBD'] = df['Distance']

#support for house type
df = pd.get_dummies(df, columns=['Type'], drop_first=True)

#select input features
feature_columns = [
    'Rooms',
    'Bathroom',
    'Car',
    'Landsize',
    'YearSold',
    'YearsSinceSale',
    'Distance_to_CBD'
]

#add encoded property type columns
type_columns = [col for col in df.columns if col.startswith('Type_')]
feature_columns += type_columns

#define input and target variables
X = df[feature_columns]
y = df['Price_Adjusted']

#split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

#define hyperparameter grid
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}

#train random forest with grid search
rf = RandomForestRegressor(random_state=42)
grid_search = GridSearchCV(
    rf,
    param_grid,
    cv=3,
    n_jobs=-1,
    scoring='neg_root_mean_squared_error'
)
grid_search.fit(X_train, y_train)

#get best performing model
best_model = grid_search.best_estimator_

#evaluate on test set
y_pred = best_model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred)
accuracy_pct = r2 * 100

print(f"Test RMSE: ${rmse:,.0f}")
print(f"R² Score: {r2:.4f} ({accuracy_pct:.1f}% accuracy)")
print(f"MAPE: {mape:.2%} average error")
print(f"Best parameters: {grid_search.best_params_}")

#print feature importances to verify model priorities
print("\nFeature Importances:")
importances = list(zip(feature_columns, best_model.feature_importances_))
importances.sort(key=lambda x: x[1], reverse=True)
for feature, importance in importances:
    print(f"  {feature}: {importance:.3f}")

#save trained model
joblib.dump(best_model, 'model/random_forest_model.joblib')

#save model metrics for API
metrics = {
    "accuracy_pct": round(accuracy_pct, 1),
    "r2_score": round(r2, 4),
    "mape": round(mape * 100, 1),
    "rmse": round(rmse, 0),
    "training_samples": len(df)
}
with open('model/model_metrics.json', 'w') as f:
    json.dump(metrics, f)

print("\nModel saved to ./model/random_forest_model.joblib")
print(f"Metrics saved to ./model/model_metrics.json")
