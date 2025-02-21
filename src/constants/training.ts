export const TRAINING_CONSTANTS = {
  MIN_SETS: 2,
  MAX_SETS: 6,
  MIN_REST: 30,
  MAX_REST: 180,
  SET_DURATION: 45, // segundos
  MIN_EXERCISES_PER_MUSCLE: 1,
  MAX_EXERCISES_PER_MUSCLE: 4,
  MAX_VOLUME_PER_WORKOUT: 300, // Volume máximo por treino
  MIN_WORKOUT_TIME: 20, // minutos
  MAX_WORKOUT_TIME: 120,
  MIN_RECOVERY_MULTIPLIER: 0.8,
  MAX_INTENSITY_MULTIPLIER: 1.5,
  DELOAD_VOLUME_REDUCTION: 0.4, // 40% redução no volume
} as const; 