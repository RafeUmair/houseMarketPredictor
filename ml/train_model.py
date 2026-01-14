import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib
import numpy as np

#load dataset
df = pd.read_csv('data/melbourne_housing.csv')

#Impute missing landsize for units and townhouses, based on average sizes by number of rooms
def impute_landsize(row):
    if pd.isna(row['Landsize']):
        if row['Type'] == 'u':
            rooms = row['Rooms']
            if rooms == 1:
                return 75
            elif rooms == 2:
                return 100
            else:
                return 150
        elif row['Type'] == 't':
            rooms = row['Rooms']
            if rooms == 1:
                return 100
            elif rooms == 2:
                return 150
            else:
                return 200
    return row['Landsize']

df['Landsize'] = df.apply(impute_landsize, axis=1)

# Drop remaining missing values
df = df.dropna()

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

print(f"Test RMSE: {rmse:.2f}")
print(f"Best parameters: {grid_search.best_params_}")

#save trained model
joblib.dump(best_model, 'model/random_forest_model.joblib')
print("Model saved to ./model/random_forest_model.joblib")
