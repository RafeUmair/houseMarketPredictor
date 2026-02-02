"""
Generates suburb statistics and ranges from the Melbourne housing dataset.
Run this script to regenerate suburb_stats.csv and suburb_ranges.csv.
"""
import pandas as pd

#Configuration
CURRENT_YEAR = 2026
ANNUAL_GROWTH_RATE = 0.065

#Load dataset
print("Loading Melbourne housing data...")
df = pd.read_csv('data/melbourne_housing.csv')
df['Suburb'] = df['Suburb'].str.lower().str.strip()
df = df.dropna(subset=['Price', 'Suburb', 'Type'])

#Apply price adjustment based on years since sale
df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
df['YearSold'] = df['Date'].dt.year
df['YearsSinceSale'] = CURRENT_YEAR - df['YearSold']
df['Price_Adjusted'] = df['Price'] * ((1 + ANNUAL_GROWTH_RATE) ** df['YearsSinceSale'])

print(f"Loaded {len(df)} properties across {df['Suburb'].nunique()} suburbs")

#Generate suburb statistics
def calc_suburb_stats(group):
    houses = group[group['Type'] == 'h']
    units = group[group['Type'] == 'u']
    townhouses = group[group['Type'] == 't']

    median_house = houses['Price_Adjusted'].median() if len(houses) > 0 else None
    median_unit = units['Price_Adjusted'].median() if len(units) > 0 else None
    median_townhouse = townhouses['Price_Adjusted'].median() if len(townhouses) > 0 else None

    #Calculate weighted average price
    total_value = 0
    total_count = 0
    if len(houses) > 0 and median_house:
        total_value += median_house * len(houses)
        total_count += len(houses)
    if len(units) > 0 and median_unit:
        total_value += median_unit * len(units)
        total_count += len(units)
    if len(townhouses) > 0 and median_townhouse:
        total_value += median_townhouse * len(townhouses)
        total_count += len(townhouses)
    avg_price = total_value / total_count if total_count > 0 else None

    return pd.Series({
        'total_sales': len(group),
        'house_count': len(houses),
        'unit_count': len(units),
        'townhouse_count': len(townhouses),
        'median_house_price': int(median_house) if median_house else None,
        'median_unit_price': int(median_unit) if median_unit else None,
        'median_townhouse_price': int(median_townhouse) if median_townhouse else None,
        'median_overall_price': int(group['Price_Adjusted'].median()),
        'avg_price': int(avg_price) if avg_price else None,
        'avg_rooms': round(group['Rooms'].mean(), 1),
        'avg_landsize': int(group['Landsize'].mean()) if group['Landsize'].notna().any() else None,
        'distance_to_cbd': round(group['Distance'].mean(), 1)
    })

print("\nGenerating suburb statistics...")
suburb_stats = df.groupby('Suburb').apply(calc_suburb_stats, include_groups=False).reset_index()
suburb_stats.columns = ['suburb'] + list(suburb_stats.columns[1:])
suburb_stats.to_csv('data/suburb_stats.csv', index=False)
print(f"Saved suburb_stats.csv ({len(suburb_stats)} suburbs)")

#Generate suburb ranges for validation
def calc_suburb_ranges(group):
    houses = group[group['Type'] == 'h']
    units = group[group['Type'] == 'u']
    townhouses = group[group['Type'] == 't']

    #Only include landsize for houses (units/townhouses have estimated values)
    house_landsize = houses['Landsize'].dropna()

    return pd.Series({
        'landsize_min': int(house_landsize.min()) if len(house_landsize) > 0 else None,
        'landsize_max': int(house_landsize.max()) if len(house_landsize) > 0 else None,
        'house_count': len(houses),
        'unit_count': len(units),
        'townhouse_count': len(townhouses),
        'total_count': len(group),
        'rooms_min': int(group['Rooms'].min()),
        'rooms_max': int(group['Rooms'].max()),
        'bathroom_min': int(group['Bathroom'].min()) if group['Bathroom'].notna().any() else None,
        'bathroom_max': int(group['Bathroom'].max()) if group['Bathroom'].notna().any() else None,
        'car_min': int(group['Car'].min()) if group['Car'].notna().any() else None,
        'car_max': int(group['Car'].max()) if group['Car'].notna().any() else None
    })

print("\nGenerating suburb ranges...")
suburb_ranges = df.groupby('Suburb').apply(calc_suburb_ranges, include_groups=False).reset_index()
suburb_ranges.columns = ['suburb'] + list(suburb_ranges.columns[1:])
suburb_ranges.to_csv('data/suburb_ranges.csv', index=False)
print(f"Saved suburb_ranges.csv ({len(suburb_ranges)} suburbs)")

print("\nDone!")
