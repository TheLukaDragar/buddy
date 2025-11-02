#!/usr/bin/env python3
import pandas as pd

# Read the CSV
df = pd.read_csv('exercises_with_groups.csv')

print(f"Total exercises: {len(df)}")
print(f"\nBefore:")
print("Home exercises sample:")
print(df[df['workout_type'] == 'home']['exercise_name'].head(5).tolist())
print("\nGym exercises sample:")
print(df[df['workout_type'] == 'gym']['exercise_name'].head(5).tolist())

# Convert all exercise names to Title Case
df['exercise_name'] = df['exercise_name'].str.title()

# Also update the slugs to match
df['exercise_slug'] = df['exercise_name'].apply(lambda x: slugify(x))

# Save back
df.to_csv('exercises_with_groups.csv', index=False, quoting=1)  # quoting=1 = QUOTE_MINIMAL

print(f"\n✅ Fixed naming convention!")
print(f"\nAfter:")
print("Home exercises sample:")
print(df[df['workout_type'] == 'home']['exercise_name'].head(5).tolist())
print("\nGym exercises sample:")
print(df[df['workout_type'] == 'gym']['exercise_name'].head(5).tolist())

def slugify(text):
    """Convert text to slug format"""
    import re
    text = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    text = text.strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text

