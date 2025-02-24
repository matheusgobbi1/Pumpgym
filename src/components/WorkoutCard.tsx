import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AIGeneratedWorkout } from '../types/training';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutCardProps {
  workout: AIGeneratedWorkout;
  isToday?: boolean;
  onPress?: () => void;
}

export function WorkoutCard({ workout, isToday, onPress }: WorkoutCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[theme.backgroundSecondary, theme.backgroundSecondary + '80']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              {workout.name}
            </Text>
          </View>
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={14}
                color={theme.primary}
              />
              <Text style={[styles.todayText, { color: theme.primary }]}>
                Hoje
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                {workout.exercises.length} exercícios
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                ~45 min
              </Text>
            </View>
          </View>

          <View style={styles.exerciseList}>
            {workout.exercises.slice(0, 3).map((exercise, index) => (
              <View key={exercise.exerciseId} style={styles.exerciseItem}>
                <Text style={[styles.exerciseText, { color: theme.text }]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseDetail, { color: theme.textSecondary }]}>
                  {exercise.sets}×{exercise.reps}
                </Text>
              </View>
            ))}
            {workout.exercises.length > 3 && (
              <Text style={[styles.moreText, { color: theme.textSecondary }]}>
                +{workout.exercises.length - 3} exercícios
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseText: {
    fontSize: 14,
  },
  exerciseDetail: {
    fontSize: 12,
  },
  moreText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
}); 