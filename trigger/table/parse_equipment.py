#!/usr/bin/env python3
import json
import re

import pandas as pd


def slugify(text):
    """Convert text to slug format (matching TypeScript version)"""
    # Remove non-alphanumeric characters except spaces and hyphens
    text = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    # Trim whitespace
    text = text.strip()
    # Replace multiple spaces with single hyphen
    text = re.sub(r'\s+', '-', text)
    # Replace multiple hyphens with single hyphen
    text = re.sub(r'-+', '-', text)
    return text


def parse_equipment_string(equipment_str):
    """
    Parse equipment string into groups structure.
    
    Examples:
    "dumbbells and bench" -> [["dumbbells"], ["bench"]]
    "dumbbells or kettlebells" -> [["dumbbells", "kettlebells"]]
    "dumbbells or kettlebells and bench" -> [["dumbbells", "kettlebells"], ["bench"]]
    """
    if pd.isna(equipment_str) or equipment_str.strip() == "":
        return []
    
    # Split by "and" first (groups)
    and_parts = [part.strip() for part in equipment_str.split(' and ')]
    
    groups = []
    for part in and_parts:
        # Split each part by "or" (alternatives within a group)
        or_parts = [item.strip() for item in part.split(' or ')]
        groups.append(or_parts)
    
    return groups

def process_csv(filepath, workout_type):
    """Process a CSV file and add equipment_groups column"""
    df = pd.read_csv(filepath)
    
    # Parse equipment into groups (with slugified equipment names)
    df['equipment_groups'] = df['equipment'].apply(lambda x: {
        "groups": [[slugify(item) for item in group] for group in parse_equipment_string(x)]
    })
    
    # Add slugified exercise name
    df['exercise_slug'] = df['exercise_name'].apply(slugify)
    
    # Add workout_type column
    df['workout_type'] = workout_type
    
    # Remove original equipment column (we have equipment_groups now)
    df = df.drop(columns=['equipment'])
    
    return df

# Process both files
print("Processing HOME exercises...")
home = process_csv('home_exercises_clean.csv', 'home')
print(f"✓ Processed {len(home)} home exercises")

print("\nProcessing GYM exercises...")
gym = process_csv('gym_exercises_clean.csv', 'gym')
print(f"✓ Processed {len(gym)} gym exercises")

# Combine both
all_exercises = pd.concat([home, gym], ignore_index=True)
print(f"\n✓ Total exercises: {len(all_exercises)}")

# Save to new CSV
all_exercises.to_csv('exercises_with_groups.csv', index=False)
print("\n✓ Saved to: exercises_with_groups.csv")

# Show some examples
print("\n" + "="*80)
print("EXAMPLES OF PARSED EQUIPMENT:")
print("="*80)

examples = [
    ('dumbbells and bench', 'home'),
    ('dumbbells or kettlebells', 'home'),
    ('dumbbells or kettlebells and chair or bench', 'home'),
    ('body weight', 'home'),
    ('resistance band', 'home'),
    ('Shoulder Press Machine', 'gym'),
]

for eq_str, wt in examples:
    result = parse_equipment_string(eq_str)
    print(f"\nInput:  '{eq_str}'")
    print(f"Output: {result}")
    print(f"JSON:   {json.dumps({'groups': result})}")

print("\n" + "="*80)
print("SAMPLE EXERCISES:")
print("="*80)
sample = all_exercises.head(10)[['exercise_name', 'exercise_slug', 'equipment_groups', 'category', 'workout_type']]
for idx, row in sample.iterrows():
    print(f"\n{row['exercise_name']}")
    print(f"  Slug:     {row['exercise_slug']}")
    print(f"  Groups:   {row['equipment_groups']}")
    print(f"  Category: {row['category']} ({row['workout_type']})")

print("\n" + "="*80)
print("UNIQUE EQUIPMENT ITEMS:")
print("="*80)
# Extract all unique equipment items
all_equipment = set()
for groups_dict in all_exercises['equipment_groups']:
    groups = groups_dict.get('groups', [])
    for group in groups:
        all_equipment.update(group)

sorted_equipment = sorted(all_equipment)
print(f"Total unique equipment items: {len(sorted_equipment)}")
for eq in sorted_equipment:
    print(f"  - {eq}")

