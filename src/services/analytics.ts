export interface WorkoutMetrics {
  totalVolume: number;
  timeUnderTension: number;
  restPeriods: number;
  muscleGroupBalance: Record<MuscleGroup, number>;
} 