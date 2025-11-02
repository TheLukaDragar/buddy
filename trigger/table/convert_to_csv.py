#!/usr/bin/env python3
import pandas as pd

# Read HOME exercises
home = pd.read_excel('vaje-skupine+oprema(HOME)-ver1.xlsx')
home.to_csv('home_exercises.csv', index=False)
print("HOME CSV created!")
print(f"Shape: {home.shape}")
print(f"Columns: {list(home.columns)}")
print("\nFirst 10 rows:")
print(home.head(10))

# Read GYM exercises  
gym = pd.read_excel('vaje, skupine + oprema (GYM) popravljen.xlsx')
gym.to_csv('gym_exercises.csv', index=False)
print("\n\nGYM CSV created!")
print(f"Shape: {gym.shape}")
print(f"Columns: {list(gym.columns)}")
print("\nFirst 10 rows:")
print(gym.head(10))

