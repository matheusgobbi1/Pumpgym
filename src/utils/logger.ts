import { WorkoutDay } from "../services/training";
import { calculateWorkoutVolume } from "./workoutCalculations";
import { averageRestTime } from "./restCalculations";

export function logWorkoutGeneration(workout: WorkoutDay): void {
  if (__DEV__) {
    console.group(`🏋️‍♂️ Treino: ${workout.name}`);
    console.log(`📊 Volume: ${calculateWorkoutVolume(workout)}`);
    console.log(`⏱️ Tempo: ${workout.estimatedTime}min`);
    console.log(`💪 Exercícios: ${workout.exercises.length}`);
    console.log(`🎯 Compostos: ${workout.exercises.filter(e => e.compound).length}`);
    console.log(`🔄 Descanso médio: ${averageRestTime(workout.exercises)}s`);
    console.groupEnd();
  }
} 