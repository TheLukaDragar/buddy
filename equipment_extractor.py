#!/usr/bin/env python3
"""
Equipment Extractor from eq.txt
Extracts all unique equipment and analyzes their relationships (AND/OR combinations)
"""

import re
from collections import Counter, defaultdict
from typing import Dict, List, Set, Tuple


def parse_equipment_line(line: str) -> List[str]:
    """
    Parse a single line of equipment text and extract individual equipment names.
    Handles cases like "dumbbells and bench" or "dumbbells or kettlebells".
    """
    # Remove extra whitespace and convert to lowercase for consistency
    line = line.strip().lower()

    if not line:
        return []

    # Split by 'and' and 'or' while keeping the connectors
    # Use regex to split on ' and ' or ' or ' but capture the delimiters
    parts = re.split(r'\s+(and|or)\s+', line)

    # Clean up the parts
    equipment_parts = []
    for part in parts:
        part = part.strip()
        if part and part not in ['and', 'or']:
            equipment_parts.append(part)

    return equipment_parts


def extract_equipment_relationships(equipment_text: str) -> Dict[str, Set[str]]:
    """
    Extract equipment and their relationships from the text.
    Returns a dictionary where keys are equipment and values are sets of related equipment.
    """
    relationships = defaultdict(set)

    # Common patterns to identify
    patterns = [
        (r'(.+?)\s+and\s+(.+)', 'and'),
        (r'(.+?)\s+or\s+(.+)', 'or'),
    ]

    for pattern, relationship_type in patterns:
        matches = re.findall(pattern, equipment_text.lower())
        for match in matches:
            equip1, equip2 = match
            equip1 = equip1.strip()
            equip2 = equip2.strip()

            # Add bidirectional relationship
            relationships[equip1].add((equip2, relationship_type))
            relationships[equip2].add((equip1, relationship_type))

    return dict(relationships)


def main():
    """
    Main function to extract and analyze equipment from eq.txt
    """
    print("🔍 Equipment Extractor")
    print("=" * 50)

    # Read the equipment file
    try:
        with open('/Users/carbs/buddy/eq.txt', 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        print("❌ Error: eq.txt file not found!")
        return

    print(f"📄 Read {len(lines)} lines from eq.txt\n")

    # Extract all equipment
    all_equipment = set()
    equipment_by_line = []
    equipment_relationships = defaultdict(list)

    for line_num, line in enumerate(lines, 1):
        parsed_equipment = parse_equipment_line(line)

        if parsed_equipment:
            equipment_by_line.append({
                'line': line_num,
                'original': line.strip(),
                'equipment': parsed_equipment
            })

            # Add to master set
            for equipment in parsed_equipment:
                all_equipment.add(equipment)

            # Track which lines mention each equipment
            for equipment in parsed_equipment:
                equipment_relationships[equipment].append(line_num)

    # Sort equipment alphabetically
    sorted_equipment = sorted(all_equipment)

    print(f"🏋️  Found {len(sorted_equipment)} unique equipment types:")
    print("-" * 40)

    # Display equipment in columns for better readability
    col_width = 25
    cols = 3
    for i in range(0, len(sorted_equipment), cols):
        row = []
        for j in range(cols):
            idx = i + j
            if idx < len(sorted_equipment):
                row.append(f"{idx+1:2d}. {sorted_equipment[idx]:<{col_width}}")
        print("".join(row))

    print(f"\n📊 Equipment Frequency Analysis:")
    print("-" * 40)

    # Count frequency of each equipment
    equipment_frequency = Counter()
    for entry in equipment_by_line:
        for equipment in entry['equipment']:
            equipment_frequency[equipment] += 1

    # Sort by frequency (most common first)
    for equipment, count in equipment_frequency.most_common():
        print(f"{equipment:<30} | {count:3d} times")

    print(f"\n🔗 Equipment Relationships (AND/OR combinations):")
    print("-" * 40)

    # Analyze relationships
    relationship_patterns = defaultdict(Counter)

    for entry in equipment_by_line:
        original_text = entry['original'].lower()

        # Find AND relationships
        if ' and ' in original_text:
            equipment = entry['equipment']
            if len(equipment) >= 2:
                combo = " + ".join(sorted(equipment))
                relationship_patterns['AND'][combo] += 1

        # Find OR relationships
        if ' or ' in original_text:
            equipment = entry['equipment']
            if len(equipment) >= 2:
                combo = " / ".join(sorted(equipment))
                relationship_patterns['OR'][combo] += 1

    # Display AND relationships
    if relationship_patterns['AND']:
        print("AND combinations (equipment used together):")
        for combo, count in relationship_patterns['AND'].most_common():
            print(f"  {combo:<40} | {count:3d} times")

    print()

    # Display OR relationships
    if relationship_patterns['OR']:
        print("OR combinations (alternative equipment):")
        for combo, count in relationship_patterns['OR'].most_common():
            print(f"  {combo:<40} | {count:3d} times")

    print(f"\n💡 Summary:")
    print(f"• Total unique equipment: {len(sorted_equipment)}")
    print(f"• Total equipment mentions: {sum(equipment_frequency.values())}")
    print(f"• Most common: {equipment_frequency.most_common(1)[0][0]} ({equipment_frequency.most_common(1)[0][1]} times)")
    print(f"• AND combinations found: {len(relationship_patterns['AND'])}")
    print(f"• OR combinations found: {len(relationship_patterns['OR'])}")

    # Save results to files
    print(f"\n💾 Saving results...")

    # Save unique equipment list
    with open('unique_equipment.txt', 'w') as f:
        f.write("UNIQUE EQUIPMENT LIST\n")
        f.write("=" * 30 + "\n\n")
        for i, equipment in enumerate(sorted_equipment, 1):
            f.write(f"{i:2d}. {equipment}\n")

    # Save equipment with frequencies
    with open('equipment_frequency.txt', 'w') as f:
        f.write("EQUIPMENT FREQUENCY ANALYSIS\n")
        f.write("=" * 30 + "\n\n")
        f.write(f"{'Equipment':<30} | {'Count':<5} | {'Percentage':<10}\n")
        f.write("-" * 60 + "\n")
        total_mentions = sum(equipment_frequency.values())
        for equipment, count in equipment_frequency.most_common():
            percentage = (count / total_mentions) * 100
            f.write(f"{equipment:<30} | {count:<5} | {percentage:<10.1f}%\n")

    # Save relationships
    with open('equipment_relationships.txt', 'w') as f:
        f.write("EQUIPMENT RELATIONSHIPS\n")
        f.write("=" * 30 + "\n\n")

        if relationship_patterns['AND']:
            f.write("AND RELATIONSHIPS (equipment used together):\n")
            f.write("-" * 50 + "\n")
            for combo, count in relationship_patterns['AND'].most_common():
                f.write(f"{combo:<40} | {count:3d} times\n")

        if relationship_patterns['OR']:
            f.write("\nOR RELATIONSHIPS (alternative equipment):\n")
            f.write("-" * 50 + "\n")
            for combo, count in relationship_patterns['OR'].most_common():
                f.write(f"{combo:<40} | {count:3d} times\n")

    print(f"✅ Results saved to:")
    print(f"  • unique_equipment.txt")
    print(f"  • equipment_frequency.txt")
    print(f"  • equipment_relationships.txt")


if __name__ == "__main__":
    main()

