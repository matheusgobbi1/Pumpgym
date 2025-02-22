import { Exercise, WorkoutDay } from "../services/training";

export function calculateWorkoutVolume(workout: WorkoutDay): number {
  return workout.exercises.reduce((total, exercise) => {
    const repsRange = exercise.reps.split("-").map(Number);
    const avgReps = (repsRange[0] + repsRange[1]) / 2;
    return total + exercise.sets * avgReps;
  }, 0);
}

export function calculateWorkoutTime(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => {
    const setTime = 45; // Tempo médio por série em segundos
    const totalSetTime = ex.sets * setTime;
    const totalRestTime = (ex.sets - 1) * ex.restTime;
    return total + (totalSetTime + totalRestTime) / 60; // Converte para minutos
  }, 0);
} 