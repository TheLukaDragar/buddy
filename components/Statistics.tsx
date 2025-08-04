import React from 'react';
import { Text, View } from 'react-native';
import { nucleus } from '../Buddy_variables.js';

export interface StatisticsData {
  completedWorkouts: number;
  averageWorkoutTime: string; // Format: "1:02:21"
  totalLiftedWeight: number; // in kg
  burnedCalories: number; // in kcal
}

interface StatisticsProps {
  data: StatisticsData;
}

export default function Statistics({ data }: StatisticsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      
      {/* First row */}
      <View style={styles.row}>
        <View style={styles.statItem}>
          <Text style={styles.valueText}>{data.completedWorkouts}</Text>
          <Text style={styles.labelText}>Completed workouts</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.valueText}>
            {data.averageWorkoutTime.split(':')[0]}:{data.averageWorkoutTime.split(':')[1]}
            <Text style={styles.unitText}>:{data.averageWorkoutTime.split(':')[2]}</Text>
          </Text>
          <Text style={styles.labelText}>Average workout time</Text>
        </View>
      </View>
      
      {/* Second row */}
      <View style={styles.row}>
        <View style={styles.statItem}>
          <Text style={styles.valueText}>
            {data.totalLiftedWeight.toLocaleString()}
            <Text style={styles.unitText}> kg</Text>
          </Text>
          <Text style={styles.labelText}>Total lifted weight</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.valueText}>
            {data.burnedCalories.toLocaleString()}
            <Text style={styles.unitText}> kcal</Text>
          </Text>
          <Text style={styles.labelText}>Burned calories</Text>
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'column' as const,
    gap: 16,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    width: '100%' as const,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 21.6, // 1.2 * 18
    color: nucleus.light.semantic.fg.base,
    textAlign: 'left' as const,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 16,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    width: '100%' as const,
  },
  statItem: {
    flex: 1,
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    minWidth: 0,
    minHeight: 0,
  },
  valueText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38.4, // 1.2 * 32
    textAlign: 'center' as const,
    color: nucleus.light.global.blue["70"],
    textAlignVertical: 'center' as const,
  },
  unitText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 19.2, // 1.2 * 16
    color: nucleus.light.global.blue["70"],
  },
  labelText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18, // 1.5 * 12
    color: nucleus.light.semantic.fg.base,
    textAlign: 'left' as const,
  },
}; 