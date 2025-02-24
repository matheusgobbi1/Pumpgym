import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useTraining } from '../../contexts/TrainingContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/LoadingScreen';
import { EmptyState } from '../../components/EmptyState';
import { WeekCalendar } from '../../components/WeekCalendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MotiView } from '@motify/components';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrainingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { activeProgram, isLoading, getWorkoutForDay } = useTraining();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (isLoading) return <LoadingScreen />;
  if (!activeProgram) return <EmptyState />;

  const selectedDayWorkout = getWorkoutForDay(selectedDate.getDay());
  const isRestDay = !selectedDayWorkout;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Calendário */}
      <WeekCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isTrainingDay={(date) => !!getWorkoutForDay(date.getDay())}
      />

      {/* Separador */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Conteúdo do Treino */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 500 }}
        >
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </Text>
        </MotiView>

        {isRestDay ? (
          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ duration: 500 }}
            style={[styles.restCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <LinearGradient
              colors={[theme.primary + '20', 'transparent']}
              style={styles.cardGradient}
            />
            <MaterialCommunityIcons name="sleep" size={32} color={theme.primary} />
            <Text style={[styles.restTitle, { color: theme.text }]}>
              Dia de Descanso
            </Text>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ duration: 500 }}
            style={[styles.workoutCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <LinearGradient
              colors={[theme.primary + '15', 'transparent']}
              style={styles.cardGradient}
            />
            
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={[styles.workoutTitle, { color: theme.text }]}>
                  {selectedDayWorkout.name}
                </Text>
                <View style={styles.workoutMetrics}>
                  <View style={styles.metric}>
                    <MaterialCommunityIcons 
                      name="dumbbell" 
                      size={14} 
                      color={theme.textSecondary} 
                    />
                    <Text style={[styles.workoutSubtitle, { color: theme.textSecondary }]}>
                      {selectedDayWorkout.exercises.length} exercícios
                    </Text>
                  </View>
                </View>
              </View>
              
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'timing',
                  duration: 200,
                  delay: 200
                }}
              >
                <Pressable
                  onPress={() => router.push("/workout")}
                  style={({ pressed }) => [
                    styles.startButton,
                    { backgroundColor: theme.primary },
                    pressed && { transform: [{ scale: 0.95 }] }
                  ]}
                >
                  <MaterialCommunityIcons name="play" size={20} color="#FFF" />
                </Pressable>
              </MotiView>
            </View>

            <View style={styles.exercisesList}>
              {selectedDayWorkout.exercises.slice(0, 2).map((exercise: Exercise, index: number) => (
                <MotiView
                  key={exercise.exerciseId}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 300 + (index * 100) }}
                  style={styles.exerciseItem}
                >
                  <MaterialCommunityIcons 
                    name="circle-small" 
                    size={20} 
                    color={theme.primary} 
                  />
                  <Text 
                    style={[styles.exerciseName, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {exercise.name}
                  </Text>
                </MotiView>
              ))}
              {selectedDayWorkout.exercises.length > 2 && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 500 }}
                >
                  <Text style={[styles.moreExercises, { color: theme.primary }]}>
                    +{selectedDayWorkout.exercises.length - 2} mais
                  </Text>
                </MotiView>
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  workoutCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
    marginRight: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
  },
  workoutMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    flex: 1,
  },
  moreExercises: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  restCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    borderRadius: 16,
  },
}); 