import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { nucleus } from '../Buddy_variables';

interface CategoryPill {
  id: string;
  label: string;
  emoji?: string;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export default function CategoryPills({ 
  categories, 
  selectedCategory = 'general',
  onCategorySelect 
}: CategoryPillsProps) {
  const [selected, setSelected] = useState(selectedCategory);

  const handlePillPress = (categoryId: string) => {
    setSelected(categoryId);
    onCategorySelect?.(categoryId);
  };

  const renderPill = (category: CategoryPill) => {
    const isSelected = selected === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.pill,
          {
            backgroundColor: isSelected 
              ? nucleus.light.global.blue["20"] // #c5ddeb - light blue for selected
              : nucleus.light.global.white, // #ffffff - white for unselected
            borderColor: isSelected 
              ? nucleus.light.global.blue["70"] // #3c81a7 - blue border for selected
              : nucleus.light.global.grey["40"], // #c1c4c6 - grey border for unselected
          }
        ]}
        onPress={() => handlePillPress(category.id)}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.pillText,
            {
              color: isSelected 
                ? nucleus.light.global.blue["70"] // #3c81a7 - blue text for selected
                : nucleus.light.global.grey["70"], // #53575a - grey text for unselected
            }
          ]}
        >
          {category.emoji ? `${category.emoji} ${category.label}` : category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={undefined} // Let it scroll freely
        bounces={true}
        scrollEventThrottle={16}
        pagingEnabled={false}
        directionalLockEnabled={true}
      >
        {categories.map(renderPill)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingLeft: 8, // Reduced left padding to show half-visible pill
    paddingRight: 16, // Normal right padding
    gap: 9, // 9px gap as per Figma
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    borderRadius: 48, // Fully rounded
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  pillText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8, // 120% of 14px
    letterSpacing: 0,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
