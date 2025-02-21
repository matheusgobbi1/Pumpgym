import { WorkoutParams, WorkoutError } from "../types/training";
import { TRAINING_CONSTANTS } from "../constants/training";
import { calculateWorkoutTime } from "./workoutCalculations";

export function validateWorkoutParams(params: WorkoutParams): WorkoutError[] {
  const errors: WorkoutError[] = [];

  // Validações básicas
  if (!params.level || !params.config || !params.goalConfig) {
    errors.push({
      code: 'TIME_INVALID',
      message: "Parâmetros obrigatórios faltando",
    });
  }

  if (params.timeAdjustment <= 0) {
    errors.push({
      code: 'TIME_INVALID',
      message: "Ajuste de tempo inválido",
      details: { timeAdjustment: params.timeAdjustment },
    });
  }

  // Validar séries
  if (params.config.setsPerExercise < TRAINING_CONSTANTS.MIN_SETS) {
    errors.push({
      code: 'VOLUME_HIGH',
      message: "Número de séries muito baixo",
      details: { sets: params.config.setsPerExercise },
    });
  }

  if (params.config.setsPerExercise > TRAINING_CONSTANTS.MAX_SETS) {
    errors.push({
      code: 'VOLUME_HIGH',
      message: "Número de séries muito alto",
      details: { sets: params.config.setsPerExercise },
    });
  }

  // Validar tempo de treino
  const estimatedTime = calculateWorkoutTime(params.exercises);
  if (estimatedTime < TRAINING_CONSTANTS.MIN_WORKOUT_TIME || 
      estimatedTime > TRAINING_CONSTANTS.MAX_WORKOUT_TIME) {
    errors.push({
      code: 'TIME_INVALID',
      message: `Tempo de treino inválido: ${estimatedTime}min`,
      details: { 
        estimatedTime,
        min: TRAINING_CONSTANTS.MIN_WORKOUT_TIME,
        max: TRAINING_CONSTANTS.MAX_WORKOUT_TIME,
      },
    });
  }

  // Validar distribuição de exercícios
  const compoundCount = params.exercises.filter(e => e.compound).length;
  const totalExercises = params.exercises.length;
  const compoundRatio = compoundCount / totalExercises;

  if (compoundRatio < params.goalConfig.compoundFocus) {
    errors.push({
      code: 'EXERCISE_DISTRIBUTION',
      message: "Proporção inadequada de exercícios compostos",
      details: {
        current: compoundRatio,
        target: params.goalConfig.compoundFocus,
        compoundCount,
        totalExercises,
      },
    });
  }

  return errors;
} 