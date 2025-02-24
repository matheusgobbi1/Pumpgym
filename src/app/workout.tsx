import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Exercise, SetData, WorkoutExercise } from '../types/training';

// Components
import { WorkoutMetrics } from '../components/WorkoutMetrics';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseBottomSheet } from '../components/ExerciseBottomSheet';
import { useTraining } from '../contexts/TrainingContext';

interface CompletedSets {
  [key: string]: SetData[];
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedSets, setCompletedSets] = useState<CompletedSets>({});
  const { activeProgram } = useTraining();
  const [workoutSets, setWorkoutSets] = useState<Record<string, SetData[]>>({});
  const { finishWorkout } = useTraining();

  const workout = activeProgram?.workouts[0]; // Tipo: Workout | undefined

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    bottomSheetRef.current?.present();
  };

  const handleSetComplete = async (exerciseId: string, setIndex: number, setData: SetData) => {
    // Atualizando ambos os estados
    setWorkoutSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), setData]
    }));
    
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), setData]
    }));
  };

  const handleSwipeLeft = (exerciseId: string) => {
    // Pular exercício
    console.log('Exercício pulado:', exerciseId);
  };

  const handleSwipeRight = (exerciseId: string) => {
    // Marcar como completo
    console.log('Exercício completo:', exerciseId);
  };

  const totalSets = workout?.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets || 0);
  }, 0) || 0;

  const completedSetsCount = Object.values(completedSets).reduce((acc, sets) => acc + sets.length, 0);
  const progress = totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

  // Função para finalizar o treino
  const handleFinishWorkout = async () => {
    if (!workout) return;

    // Garantir que temos todos os dados necessários
    const exercises = Object.entries(workoutSets)
      .filter(([exerciseId, sets]) => exerciseId && sets.length > 0)
      .map(([exerciseId, sets]) => ({
        exerciseId,
        sets: sets.map(set => ({
          ...set,
          timestamp: Date.now()
        }))
      }));

    if (exercises.length === 0) {
      Alert.alert('Atenção', 'Complete pelo menos uma série antes de finalizar o treino.');
      return;
    }

    const workoutId = `workout_${Date.now()}_${workout.name.toLowerCase().replace(/\s+/g, '_')}`;
    const success = await finishWorkout(workoutId, exercises);
    
    if (success) {
      router.back();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o treino. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {workout?.name}
        </Text>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="timer" size={24} color={theme.primary} />
        </View>
      </View>

      {/* Métricas do Treino */}
      <WorkoutMetrics
        totalSets={totalSets}
        completedSets={completedSetsCount}
        progress={progress}
        duration="00:00"
      />

      {/* Lista de Exercícios */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workout?.exercises.map((exercise: WorkoutExercise, index: number) => (
          <MotiView
            key={exercise.exerciseId}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: index * 100 }}
          >
            <ExerciseCard
              exercise={exercise}
              onPress={() => handleExercisePress(exercise)}
              onSwipeLeft={() => handleSwipeLeft(exercise.exerciseId)}
              onSwipeRight={() => handleSwipeRight(exercise.exerciseId)}
              completedSets={completedSets[exercise.exerciseId]?.length || 0}
              totalSets={exercise.sets}
              index={index}
            />
          </MotiView>
        ))}
      </ScrollView>

      {/* Bottom Sheet do Exercício */}
      <ExerciseBottomSheet
        ref={bottomSheetRef}
        exercise={selectedExercise}
        onSetComplete={handleSetComplete}
        completedSets={selectedExercise ? completedSets[selectedExercise.exerciseId] || [] : []}
      />

      <Pressable 
        onPress={handleFinishWorkout}
        style={({ pressed }) => [
          styles.finishButton,
          { backgroundColor: theme.primary },
          pressed && { opacity: 0.8 }
        ]}
      >
        <Text style={styles.finishButtonText}>Finalizar Treino</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  finishButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 