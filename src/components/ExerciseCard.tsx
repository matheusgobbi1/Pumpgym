import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Exercise } from '../types/training';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  completedSets: number;
  totalSets: number;
  index: number;
  onSwipeLeft?: () => void;  // Tornando opcional
  onSwipeRight?: () => void; // Tornando opcional
}

export function ExerciseCard({ exercise, onPress, completedSets, totalSets, index }: ExerciseCardProps) {
  const { theme } = useTheme();
  const progress = (completedSets / totalSets) * 100;
  const isCompleted = completedSets === totalSets;

  // Simulação de dados para feedback
  const suggestedWeight = '20kg';
  const suggestedReps = exercise.reps;
  const isProgressAvailable = completedSets > 0;

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
        translateY: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateY: 0,
      }}
      transition={{
        type: 'timing',
        duration: 400,
        delay: index * 100,
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: theme.backgroundSecondary },
          pressed && styles.pressed
        ]}
      >
        {/* Barra de Progresso Animada */}
        <MotiView
          animate={{
            width: `${progress}%`,
            backgroundColor: isCompleted ? theme.success : theme.primary,
          }}
          transition={{
            type: 'timing',
            duration: 500,
          }}
          style={styles.progressBar}
        />

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            {/* Nome do Exercício */}
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {exercise.name}
            </Text>
            
            {/* Info das Séries com Animação */}
            <MotiView
              animate={{
                scale: completedSets > 0 ? [1, 1.05, 1] : 1,
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
            >
              <Text style={[styles.sets, { color: theme.textSecondary }]}>
                {completedSets}/{totalSets} séries
              </Text>
            </MotiView>

            {/* Sugestão de Carga/Reps */}
            <View style={styles.suggestion}>
              <MaterialCommunityIcons 
                name="trending-up" 
                size={14} 
                color={theme.primary} 
                style={styles.suggestionIcon}
              />
              <Text style={[styles.suggestionText, { color: theme.primary }]}>
                Sugestão: {suggestedWeight} × {suggestedReps}
              </Text>
            </View>
          </View>

          {/* Indicador de Status Animado */}
          <AnimatePresence>
            <MotiView
              animate={{
                scale: isCompleted ? [1, 1.2, 1] : 1,
                rotate: isCompleted ? ['0deg', '45deg', '0deg'] : '0deg',
              }}
              transition={{
                type: 'timing',
                duration: 400,
              }}
              style={styles.status}
            >
              {isCompleted ? (
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
              ) : (
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={theme.textSecondary}
                />
              )}
            </MotiView>
          </AnimatePresence>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    opacity: 0.1,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 2,
  },
  mainInfo: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sets: {
    fontSize: 14,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  status: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 