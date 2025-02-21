import { Exercise, WorkoutDay } from "../services/training";

export function calculateWorkoutVolume(workout: WorkoutDay): number {
  return workout.exercises.reduce((total, exercise) => {
    const repsRange = exercise.reps.split("-").map(Number);
    const avgReps = (repsRange[0] + repsRange[1]) / 2;
    return total + exercise.sets * avgReps;
  }, 0);
} 