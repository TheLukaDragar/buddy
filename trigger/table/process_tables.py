#!/usr/bin/env python3
import pandas as pd

# Process HOME exercises
print("Processing HOME exercises...")
home = pd.read_excel('vaje-skupine+oprema(HOME)-ver1.xlsx')

# Create a proper table with category column
home_data = []
current_category = None

for idx, row in home.iterrows():
    exercise_name = row['Unnamed: 0']
    equipment = row['OPREMA']
    
    # Check if this is a category header (equipment is NaN and name is a category)
    if pd.isna(equipment) and exercise_name in ['Rame', 'Roke', 'Prsa', 'Hrbet', 'Noge', 'Jedro']:
        current_category = exercise_name
    elif not pd.isna(equipment) and current_category:
        # This is an actual exercise
        home_data.append({
            'exercise_name': exercise_name,
            'equipment': equipment,
            'category': current_category
        })

home_clean = pd.DataFrame(home_data)
home_clean.to_csv('home_exercises_clean.csv', index=False)
print(f"✓ HOME exercises processed: {len(home_clean)} exercises")
print(f"  Categories: {home_clean['category'].value_counts().to_dict()}")

# Process GYM exercises
print("\nProcessing GYM exercises...")
gym = pd.read_excel('vaje, skupine + oprema (GYM) popravljen.xlsx')

# Create a proper table with category column
gym_data = []
current_category = None

for idx, row in gym.iterrows():
    exercise_name = row['Rame']
    equipment = row['oprema']
    all_equipment = row['vsa oprema seznam']
    missing_equipment = row['Manjkajoča oprema']
    
    # Check if this is a category header
    if pd.isna(equipment) and pd.isna(all_equipment) and exercise_name in ['Roke', 'Prsa', 'Hrbet', 'Noge', 'jedro']:
        current_category = exercise_name
    elif not pd.isna(equipment):
        # This is an actual exercise
        gym_data.append({
            'exercise_name': exercise_name,
            'equipment': equipment,
            'all_equipment_list': all_equipment if not pd.isna(all_equipment) else '',
            'missing_equipment': missing_equipment if not pd.isna(missing_equipment) else '',
            'category': current_category if current_category else 'Rame'  # First section is Rame
        })

gym_clean = pd.DataFrame(gym_data)
gym_clean.to_csv('gym_exercises_clean.csv', index=False)
print(f"✓ GYM exercises processed: {len(gym_clean)} exercises")
print(f"  Categories: {gym_clean['category'].value_counts().to_dict()}")

# Display samples
print("\n" + "="*60)
print("HOME EXERCISES SAMPLE:")
print("="*60)
print(home_clean.head(10).to_string(index=False))

print("\n" + "="*60)
print("GYM EXERCISES SAMPLE:")
print("="*60)
print(gym_clean.head(10).to_string(index=False))

print("\n" + "="*60)
print("SUMMARY:")
print("="*60)
print(f"Total HOME exercises: {len(home_clean)}")
print(f"Total GYM exercises: {len(gym_clean)}")
print(f"\nFiles created:")
print("  - home_exercises_clean.csv")
print("  - gym_exercises_clean.csv")

