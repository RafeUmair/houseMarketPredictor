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
    #Check for missing OR zero landsize
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

#Drop remaining missing values
df = df.dropna()

#Remove outliers that skew the model
#limit Houses to 50-1000 sqm removes acreages and data errors
#Units/townhouses, landsize is auto calculated based on rooms
df = df[
    ((df['Type'] == 'h') & (df['Landsize'] >= 50) & (df['Landsize'] <= 1000)) |
    (df['Type'].isin(['u', 't']))
]

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

#normalize suburb names to match the API's lookup convention
df['Suburb'] = df['Suburb'].str.lower().str.strip()

#support for house type
df = pd.get_dummies(df, columns=['Type'], drop_first=True)

#select input features
feature_columns = [
    'Rooms',
    'Bathroom',
    'Car',
    'Landsize',
    'Distance_to_CBD'
]

#add encoded property type columns
type_columns = [col for col in df.columns if col.startswith('Type_')]
feature_columns += type_columns

#define input and target variables (keep Suburb along for the ride so it survives the split)
X = df[feature_columns + ['Suburb']]
y = df['Price_Adjusted']

#split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

#Suburb is a huge price signal on its own (two suburbs at the same distance from
#the CBD can differ in price by 3x) but the model had no way to see it - only a
#single Distance_to_CBD number. Encode it as a smoothed target mean, fit on the
#training split only so the test set stays a genuine holdout.
global_mean_price = y_train.mean()
suburb_stats_train = y_train.groupby(X_train['Suburb']).agg(['mean', 'count'])

#shrink small-sample suburbs toward the global mean so a suburb with 1-2 sales
#doesn't get treated as a confident price signal
smoothing = 10
suburb_price_index = (
    (suburb_stats_train['mean'] * suburb_stats_train['count'] + global_mean_price * smoothing)
    / (suburb_stats_train['count'] + smoothing)
).to_dict()

X_train = X_train.copy()
X_test = X_test.copy()
X_train['Suburb_Price_Index'] = X_train['Suburb'].map(suburb_price_index)
X_test['Suburb_Price_Index'] = X_test['Suburb'].map(suburb_price_index).fillna(global_mean_price)
X_train = X_train.drop(columns=['Suburb'])
X_test = X_test.drop(columns=['Suburb'])
feature_columns += ['Suburb_Price_Index']

#save the suburb price index for the API to use at inference time
with open('model/suburb_price_index.json', 'w') as f:
    json.dump({
        "suburbs": {k: round(v, 0) for k, v in suburb_price_index.items()},
        "global_mean": round(global_mean_price, 0)
    }, f)

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
