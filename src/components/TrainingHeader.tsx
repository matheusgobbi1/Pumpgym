import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../constants/colors';
import { AITrainingPlan } from '../services/aiTraining';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  workout: AITrainingPlan['workouts'][0];
}

export function TrainingHeader({ workout }: Props) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {workout.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {workout.focusArea}
        </Text>
      </View>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary} />
          <Text style={[styles.metricText, { color: colors.text }]}>
            {workout.exercises.length} exercícios
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
  metrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 16,
  },
}); 