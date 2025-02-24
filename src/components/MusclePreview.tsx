import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '../contexts/ThemeContext';

interface MusclePreviewProps {
  muscleGroup: string;
  intensity: number; // 0-1
}

export function MusclePreview({ muscleGroup, intensity }: MusclePreviewProps) {
  const { theme } = useTheme();
  
  return (
    <MotiView 
      style={styles.container}
      animate={{ 
        backgroundColor: `rgba(${theme.primary}, ${intensity * 0.3})`
      }}
    >
      <MaterialCommunityIcons 
        name={getMuscleIcon(muscleGroup)}
        size={24} 
        color={theme.primary}
      />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function getMuscleIcon(muscle: string): string {
  const icons: Record<string, string> = {
    chest: 'pectorals',
    back: 'back',
    shoulders: 'shoulder',
    biceps: 'arm-flex',
    triceps: 'arm-flex',
    legs: 'leg',
    core: 'abs',
  };
  return icons[muscle] || 'dumbbell';
} 