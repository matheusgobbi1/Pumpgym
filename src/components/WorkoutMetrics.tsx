import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutMetricsProps {
  totalSets: number;
  completedSets: number;
  progress: number;
  duration: string;
}

export function WorkoutMetrics({ totalSets, completedSets, progress, duration }: WorkoutMetricsProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <LinearGradient
        colors={[theme.primary + '10', 'transparent']}
        style={styles.gradient}
      />

      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <MotiView
            animate={{ width: `${progress}%` }}
            transition={{ type: 'timing', duration: 300 }}
            style={[styles.progressFill, { backgroundColor: theme.primary }]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {progress.toFixed(0)}%
        </Text>
      </View>

      {/* Métricas */}
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={theme.primary} />
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {completedSets}/{totalSets}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Séries
          </Text>
        </View>

        <View style={styles.metric}>
          <MaterialCommunityIcons name="timer" size={24} color={theme.primary} />
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {duration}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Duração
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
}); 