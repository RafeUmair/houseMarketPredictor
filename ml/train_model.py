import pandas as pd

#load dataset
df = pd.read_csv('../data/melbourne_housing.csv')

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

#Calculate today's adjusted price
df['Price_Adjusted'] = df['Price'] * ((1 + annual_growth_rate) ** df['YearsSinceSale'])

#Define inpput and output sets
feature_columns = ['Rooms', 'Distance', 'Bathroom', 'Car', 'Landsize', 'YearSold', 'YearsSinceSale']
X = df[feature_columns]
y = df['Price_Adjusted']

